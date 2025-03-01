import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Game, GameType } from '../../domain/entities/game.entity';
import { Player } from '../../domain/entities/player.entity';
import { GameScore } from '../../domain/entities/game-score.entity';
import { Round } from '../../domain/entities/round.entity';
import { PlayerScore } from '../../domain/interfaces/player-score.interface';
import { PlayerInfo } from '../../domain/interfaces/player-info.interface';
import { GameMetadata } from '../../domain/interfaces/game-metadata.interface';
import { CurrentScore } from '../../domain/interfaces/current-score.interface';
import { PlayerTotalScore } from '../../domain/interfaces/player-total-score.interface';

@Injectable()
export class GameService {
  constructor(
    @InjectRepository(Game)
    private readonly gameRepository: Repository<Game>,
    @InjectRepository(Player)
    private readonly playerRepository: Repository<Player>,
    @InjectRepository(GameScore)
    private readonly scoreRepository: Repository<GameScore>,
    @InjectRepository(Round)
    private readonly roundRepository: Repository<Round>,
  ) { }

  async getActiveGame(): Promise<Game | null> {
    return this.gameRepository.findOne({
      where: { isActive: true },
      relations: ['players', 'rounds', 'scores'],
    });
  }

  async createGame(type: GameType, metadata: GameMetadata): Promise<Game> {
    await this.deactivateCurrentGame();
    const game = this.gameRepository.create({
      type,
      metadata,
      isActive: true,
      currentRoundNumber: 1,
    });
    const savedGame = await this.gameRepository.save(game);
    await this.createFirstRound(savedGame);
    return savedGame;
  }

  async addPlayerToGame(playerId: string, playerInfo?: PlayerInfo): Promise<Game> {
    const game = await this.getActiveGame();
    if (!game) throw new RpcException('No active game found');

    const player = await this.getOrCreatePlayer(playerId, playerInfo);

    if (game.type === GameType.POKER) {
      await this.handlePokerPlayerJoin(game, player);
    }

    await this.validatePlayerJoin(game, player);
    const isPlayerInGame = game.players?.some(p => p.telegramId === player.telegramId)
    if (!isPlayerInGame) {
      game.players = game.players || [];
      game.players.push(player);
      const { rounds, scores, ...rest } = game;
      await this.gameRepository.save(rest);
    }
    return game;
  }

  async recordScore(playerId: string, points: number, rank?: number): Promise<{ playerScores: PlayerScore[] }> {
    const game = await this.getActiveGame();
    if (!game) throw new RpcException('No active game found');

    await this.validateGameState(game);
    const player = await this.getPlayer(playerId);
    await this.validatePlayerState(game, player);

    const round = await this.getCurrentRound(game);

    const score = await this.updateOrCreateScore(game, round, player, points, rank);

    const updatedRound = await this.getCurrentRound(game);
    await this.handleRoundCompletion(game, updatedRound);

    return {
      playerScores: this.mapRoundScores(updatedRound),
    };
  }

  async getCurrentScores(): Promise<CurrentScore[]> {
    const game = await this.getActiveGame();
    if (!game) throw new RpcException('No active game found');

    const round = await this.getCurrentRound(game);
    return this.mapCurrentScores(round);
  }

  async endGame(): Promise<Game> {
    const game = await this.getActiveGame();
    if (!game) throw new RpcException('No active game found');

    await this.validateGameEnd(game);
    await this.updateGameMetadata(game);

    game.isActive = false;
    game.endedAt = new Date();
    return this.gameRepository.save(game);
  }

  async getTotalScores(): Promise<PlayerTotalScore[]> {
    const game = await this.getActiveGame();
    if (!game) throw new RpcException('No active game found');

    const scores = await this.getAllGameScores(game);
    return this.calculateTotalScores(scores);
  }

  // Private methods for round management
  private async createFirstRound(game: Game): Promise<void> {
    const maxRound = await this.getMaxRoundNumber(game.id);
    const nextRoundNumber = (maxRound?.maxRoundNumber || 0) + 1;

    game.currentRoundNumber = nextRoundNumber;
    await this.gameRepository.save(game);

    const round = this.roundRepository.create({
      game,
      roundNumber: nextRoundNumber,
    });
    await this.roundRepository.save(round);
  }

  private async getCurrentRound(game: Game): Promise<Round> {
    const round = await this.roundRepository.findOne({
      where: {
        game: { id: game.id },
        roundNumber: game.currentRoundNumber,
      },
      relations: ['scores', 'scores.player'],
    });

    if (!round) throw new RpcException('Current round not found');
    return round;
  }

  private async createNextRound(game: Game): Promise<void> {
    const maxRound = await this.getMaxRoundNumber(game.id);
    const nextRoundNumber = (maxRound?.maxRoundNumber || 0) + 1;

    game.currentRoundNumber = nextRoundNumber;
    const { rounds, scores, ...rest } = game;
    await this.gameRepository.save(rest);

    const newRound = this.roundRepository.create({
      game,
      roundNumber: nextRoundNumber,
    });
    await this.roundRepository.save(newRound);
  }

  private async getMaxRoundNumber(gameId: string): Promise<{ maxRoundNumber: number }> {
    return this.roundRepository.createQueryBuilder('round')
      .where('round.gameId = :gameId', { gameId })
      .select('MAX(round.roundNumber)', 'maxRoundNumber')
      .getRawOne();
  }

  // Private methods for game management
  private async deactivateCurrentGame(): Promise<void> {
    const activeGame = await this.getActiveGame();
    if (activeGame) {
      activeGame.isActive = false;
      activeGame.endedAt = new Date();
      await this.gameRepository.save(activeGame);
    }
  }

  // Private methods for player management
  private async getOrCreatePlayer(playerId: string, playerInfo?: PlayerInfo): Promise<Player> {
    let player = await this.playerRepository.findOne({
      where: { telegramId: playerId },
      relations: ['games']
    });

    if (!player && playerInfo) {
      player = await this.createPlayer(playerId, playerInfo);
    } else if (!player) {
      throw new RpcException('Player info is required for new player');
    }

    return player;
  }

  private async createPlayer(playerId: string, playerInfo: PlayerInfo): Promise<Player> {
    const player = this.playerRepository.create({
      telegramId: playerId,
      username: playerInfo.username,
      displayName: playerInfo.displayName,
      balance: 0,
    });
    return this.playerRepository.save(player);
  }

  private async getPlayer(playerId: string): Promise<Player> {
    const player = await this.playerRepository.findOne({
      where: { telegramId: playerId },
    });
    if (!player) throw new RpcException('Player not found');
    return player;
  }

  // Private methods for score management
  private async getPlayerCurrentScore(playerId: string): Promise<number> {
    const game = await this.getActiveGame();
    if (!game) return 0;

    const scores = await this.scoreRepository.find({
      where: {
        game: { id: game.id },
        player: { telegramId: playerId }
      }
    });

    return scores.reduce((sum, score) => sum + Number(score.points), 0);
  }

  private async updateOrCreateScore(
    game: Game,
    round: Round,
    player: Player,
    points: number,
    rank?: number
  ): Promise<GameScore> {
    const existingScore = round.scores.find(score => score.player.id === player.id);
    const amount = points * (game.metadata?.pointValue ?? 1);

    if (existingScore) {
      existingScore.points = points;
      existingScore.amount = amount;
      existingScore.metadata = { ...existingScore.metadata, rank };
      return this.scoreRepository.save(existingScore);
    }

    const newScore = this.scoreRepository.create({
      game,
      round,
      player,
      points,
      amount,
      roundNumber: game.currentRoundNumber,
      metadata: { rank },
    });
    return this.scoreRepository.save(newScore);
  }

  // Private methods for validation
  private async validatePlayerJoin(game: Game, player: Player): Promise<void> {
    if (game.type === GameType.TIENLEN && game.players?.length >= 4) {
      throw new RpcException('Tiến Lên game already has maximum players');
    }
  }

  private async validateGameState(game: Game): Promise<void> {
    if (game.type === GameType.TIENLEN && (!game.players || game.players.length !== 4)) {
      throw new RpcException('Tiến Lên game requires exactly 4 players to record scores');
    }
  }

  private async validatePlayerState(game: Game, player: Player): Promise<void> {
    if (game.type === GameType.POKER) {
      const currentScore = await this.getPlayerCurrentScore(player.telegramId);
      const isHaveRoundUnCompleted = await this.haveRoundUnCompleted(game, player);
      if (currentScore === 0 && !isHaveRoundUnCompleted) {
        throw new RpcException('Player needs to join game again to deposit 500 points before continuing');
      }
    }
  }

  private async haveRoundUnCompleted(game: Game, player: Player): Promise<boolean> {
    const round = await this.roundRepository.findOne({
      where: {
        isCompleted: false,
        game: { id: game.id },
        scores: { player: { id: player.id } }
      },
    })
    return !!round;
  }

  private validateRoundScores(game: Game, round: Round): void {
    const totalPoints = round.scores.reduce((sum, score) => sum + Number(score.points), 0);

    if (game.type === GameType.POKER && Math.abs(totalPoints) !== 0) {
      throw new RpcException('Total points in Poker must be 0');
    }

    if (game.type === GameType.TIENLEN && Math.abs(totalPoints - 6) !== 0) {
      throw new RpcException('Total points in Tiến Lên must be 6');
    }
  }

  private async validateGameEnd(game: Game): Promise<void> {
    if (game.type === GameType.POKER) {
      const scores = await this.getAllGameScores(game);
      const totalPoints = scores.reduce((sum, score) => sum + Number(score.points), 0);
      if (totalPoints !== 0) {
        throw new RpcException('Cannot end Poker game - total points must be 0');
      }
    } else if (game.type === GameType.TIENLEN) {
      const playerScores = await this.getTotalScores();
      if (playerScores.length < 4) {
        throw new RpcException('Cannot end Tiến Lên game - requires 4 players');
      }
    }
  }

  // Private methods for game specific logic
  private async handlePokerPlayerJoin(game: Game, player: Player): Promise<void> {
    const currentScore = await this.getPlayerCurrentScore(player.telegramId);
    if (!player.games?.length || currentScore === 0) {
      await this.giveInitialPokerPoints(game, player);
    }
  }

  private async giveInitialPokerPoints(game: Game, player: Player): Promise<void> {
    const maxRound = await this.getMaxRoundNumber(game.id);
    const nextRoundNumber = (maxRound?.maxRoundNumber || 0) + 1;

    const newRound = this.roundRepository.create({
      game: game,
      roundNumber: nextRoundNumber,
      isCompleted: true,
      completedAt: new Date(),
    });
    const savedRound = await this.roundRepository.save(newRound);

    const score = this.scoreRepository.create({
      game: game,
      round: savedRound,
      player,
      points: 500,
      amount: 500 * (game.metadata?.pointValue ?? 1),
      roundNumber: nextRoundNumber,
    });
    await this.scoreRepository.save(score);
  }

  private async handleRoundCompletion(game: Game, round: Round): Promise<void> {
    const shouldCreateNewRound = this.shouldCreateNewRound(game, round);
    if (shouldCreateNewRound) {
      await this.validateRoundScores(game, round);
      await this.completeRound(round);
      await this.createNextRound(game);
    }
  }

  private shouldCreateNewRound(game: Game, round: Round): boolean {
    if (game.type === GameType.POKER) {
      const playersInCurrentRound = round.scores;
      const totalPoints = playersInCurrentRound.reduce((sum, score) => sum + Number(score.points), 0);
      return playersInCurrentRound.length >= 2 && totalPoints === 0;
    }
    return round.scores.length === game.players.length;
  }

  private async completeRound(round: Round): Promise<void> {
    round.isCompleted = true;
    round.completedAt = new Date();
    await this.roundRepository.save(round);
  }

  // Private methods for data mapping
  private mapRoundScores(round: Round): PlayerScore[] {
    return round.scores.map(score => ({
      playerId: score.player.telegramId,
      totalPoints: Number(score.points),
      playerName: score.player.displayName || score.player.username || `Player ${score.player.telegramId}`,
    }));
  }

  private mapCurrentScores(round: Round): CurrentScore[] {
    return round.scores.map(score => ({
      playerId: score.player.telegramId,
      points: Number(score.points)
    }));
  }

  private async getAllGameScores(game: Game): Promise<GameScore[]> {
    return this.scoreRepository.find({
      where: { game: { id: game.id } },
      relations: ['player', 'game'],
    });
  }

  private calculateTotalScores(scores: GameScore[]): PlayerTotalScore[] {
    const playerScoresMap = new Map<string, { name: string; points: number }>();

    scores.forEach(score => {
      const playerId = score.player.telegramId;
      const playerName = score.player.displayName || score.player.username || `Player ${playerId}`;
      const currentData = playerScoresMap.get(playerId);

      if (currentData) {
        currentData.points += Number(score.points);
      } else {
        playerScoresMap.set(playerId, {
          name: playerName,
          points: Number(score.points)
        });
      }
    });

    const playerScores = Array.from(playerScoresMap.entries()).map(([playerId, data]) => ({
      playerId,
      playerName: data.name,
      totalPoints: Number(data.points.toFixed(2))
    }));

    return playerScores.sort((a, b) => b.totalPoints - a.totalPoints);
  }

  private async updateGameMetadata(game: Game): Promise<void> {
    if (game.type === GameType.TIENLEN) {
      const playerScores = await this.getTotalScores();
      const currentMetadata = game.metadata;

      game.metadata = {
        initialPoints: currentMetadata.initialPoints,
        pointValue: currentMetadata.pointValue,
        maxPlayers: currentMetadata.maxPlayers,
        winners: [
          {
            playerId: playerScores[0].playerId,
            playerName: playerScores[0].playerName,
            points: playerScores[0].totalPoints
          },
          {
            playerId: playerScores[1].playerId,
            playerName: playerScores[1].playerName,
            points: playerScores[1].totalPoints
          }
        ],
        losers: [
          {
            playerId: playerScores[2].playerId,
            playerName: playerScores[2].playerName,
            points: playerScores[2].totalPoints
          },
          {
            playerId: playerScores[3].playerId,
            playerName: playerScores[3].playerName,
            points: playerScores[3].totalPoints
          }
        ],
      };
    }
  }

  // New methods for reporting system
  async getGameStatistics(
    startDate?: Date,
    endDate?: Date,
    gameType?: string,
    playerId?: string,
  ): Promise<{
    totalGames: number;
    activeGames: number;
    completedGames: number;
    gamesByType: Record<string, number>;
    games: Game[];
    playerStats?: {
      totalPlayers: number;
      topPlayers: Array<{ playerId: string; playerName: string; gamesPlayed: number; totalPoints: number }>;
    };
  }> {
    const whereClause: any = {};
    
    if (startDate && endDate) {
      whereClause.createdAt = Between(startDate, endDate);
    }
    
    if (gameType) {
      whereClause.type = gameType;
    }
    
    let games = await this.gameRepository.find({
      where: whereClause,
      relations: ['players', 'scores', 'scores.player'],
      order: { createdAt: 'DESC' },
    });
    
    // Filter by player if specified
    if (playerId) {
      games = games.filter(game => 
        game.players.some(player => player.telegramId === playerId)
      );
    }
    
    // Count games by type
    const gamesByType: Record<string, number> = {};
    games.forEach(game => {
      const type = game.type;
      gamesByType[type] = (gamesByType[type] || 0) + 1;
    });
    
    // Get player statistics if no specific player is requested
    let playerStats;
    if (!playerId) {
      const allPlayers = await this.playerRepository.find();
      
      // Calculate player statistics
      const playerScoreMap = new Map<string, { 
        playerId: string; 
        playerName: string; 
        gamesPlayed: number; 
        totalPoints: number;
      }>();
      
      for (const game of games) {
        for (const score of game.scores) {
          const playerId = score.player.telegramId;
          const playerName = score.player.displayName || score.player.username;
          
          if (!playerScoreMap.has(playerId)) {
            playerScoreMap.set(playerId, {
              playerId,
              playerName,
              gamesPlayed: 0,
              totalPoints: 0,
            });
          }
          
          const playerData = playerScoreMap.get(playerId);
          playerData.totalPoints += Number(score.points);
          
          // Count unique games
          const isNewGame = !playerData.gamesPlayed || 
            !game.scores.some(s => 
              s.player.telegramId === playerId && 
              s.gameId !== game.id
            );
          
          if (isNewGame) {
            playerData.gamesPlayed += 1;
          }
        }
      }
      
      // Sort players by total points
      const topPlayers = Array.from(playerScoreMap.values())
        .sort((a, b) => b.totalPoints - a.totalPoints)
        .slice(0, 10);
      
      playerStats = {
        totalPlayers: allPlayers.length,
        topPlayers,
      };
    }
    
    return {
      totalGames: games.length,
      activeGames: games.filter(game => game.isActive).length,
      completedGames: games.filter(game => !game.isActive).length,
      gamesByType,
      games,
      playerStats,
    };
  }

  async getPlayerStatistics(
    playerId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<{
    player: Player;
    totalGames: number;
    gamesWon: number;
    gamesLost: number;
    winRate: number;
    totalPoints: number;
    averagePointsPerGame: number;
    gameHistory: Array<{
      gameId: string;
      gameType: string;
      date: Date;
      points: number;
      position?: number;
      result: 'win' | 'loss' | 'draw';
    }>;
  }> {
    const player = await this.playerRepository.findOne({
      where: { telegramId: playerId },
    });
    
    if (!player) {
      throw new Error('Player not found');
    }
    
    // Get all games the player participated in
    const whereClause: any = {};
    
    if (startDate && endDate) {
      whereClause.createdAt = Between(startDate, endDate);
    }
    
    const games = await this.gameRepository.find({
      relations: ['scores', 'scores.player'],
    });
    
    // Filter games where the player participated
    const playerGames = games.filter(game => 
      game.scores.some(score => score.player.id === player.id)
    );
    
    // Calculate statistics
    let totalPoints = 0;
    let gamesWon = 0;
    let gamesLost = 0;
    const gameHistory: Array<{
      gameId: string;
      gameType: string;
      date: Date;
      points: number;
      position?: number;
      result: 'win' | 'loss' | 'draw';
    }> = [];
    
    playerGames.forEach(game => {
      // Get player's score in this game
      const playerScores = game.scores.filter(score => score.player.id === player.id);
      const totalGamePoints = playerScores.reduce((sum, score) => sum + Number(score.points), 0);
      
      totalPoints += totalGamePoints;
      
      // Determine win/loss
      let result: 'win' | 'loss' | 'draw' = 'draw';
      let position: number | undefined = undefined;
      
      if (game.type === 'poker') {
        result = totalGamePoints > 0 ? 'win' : totalGamePoints < 0 ? 'loss' : 'draw';
      } else if (game.type === 'tienlen' && game.metadata?.winners && game.metadata?.losers) {
        // Check if player is in winners
        const isWinner = game.metadata.winners.some((w: any) => w.playerId === playerId);
        const isLoser = game.metadata.losers.some((l: any) => l.playerId === playerId);
        
        result = isWinner ? 'win' : isLoser ? 'loss' : 'draw';
        
        // Find position
        const allPlayers = [
          ...(game.metadata.winners || []),
          ...(game.metadata.losers || []),
        ];
        
        const playerIndex = allPlayers.findIndex((p: any) => p.playerId === playerId);
        if (playerIndex !== -1) {
          position = playerIndex + 1;
        }
      }
      
      if (result === 'win') gamesWon++;
      if (result === 'loss') gamesLost++;
      
      gameHistory.push({
        gameId: game.id,
        gameType: game.type,
        date: game.createdAt,
        points: totalGamePoints,
        position,
        result,
      });
    });
    
    // Sort game history by date (newest first)
    gameHistory.sort((a, b) => b.date.getTime() - a.date.getTime());
    
    const totalGames = playerGames.length;
    const winRate = totalGames > 0 ? (gamesWon / totalGames) * 100 : 0;
    const averagePointsPerGame = totalGames > 0 ? totalPoints / totalGames : 0;
    
    return {
      player,
      totalGames,
      gamesWon,
      gamesLost,
      winRate,
      totalPoints,
      averagePointsPerGame,
      gameHistory,
    };
  }

  async getGameDetails(
    gameId: string,
  ): Promise<{
    game: Game;
    players: Player[];
    rounds: Round[];
    scores: GameScore[];
    summary: {
      totalRounds: number;
      playerScores: Array<{
        playerId: string;
        playerName: string;
        totalPoints: number;
        position: number;
      }>;
    };
  }> {
    const game = await this.gameRepository.findOne({
      where: { id: gameId },
      relations: ['players', 'rounds', 'scores', 'scores.player'],
    });
    
    if (!game) {
      throw new Error('Game not found');
    }
    
    // Calculate player total scores
    const playerScores = this.calculateTotalScores(game.scores);
    
    // Add position to player scores
    const rankedPlayerScores = playerScores
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .map((score, index) => ({
        ...score,
        position: index + 1,
      }));
    
    return {
      game,
      players: game.players,
      rounds: game.rounds,
      scores: game.scores,
      summary: {
        totalRounds: game.rounds.length,
        playerScores: rankedPlayerScores,
      },
    };
  }
}