import { Injectable, Inject, NotFoundException } from '@nestjs/common';
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
  ) {}

  async getActiveGame(): Promise<Game | null> {
    return this.gameRepository.findOne({
      where: { isActive: true },
      relations: ['players', 'rounds', 'scores'],
    });
  }

  async createGame(type: GameType, metadata: GameMetadata): Promise<Game> {
    const activeGame = await this.getActiveGame();
    if (activeGame) {
      activeGame.isActive = false;
      activeGame.endedAt = new Date();
      await this.gameRepository.save(activeGame);
    }

    const game = this.gameRepository.create({
      type,
      metadata,
      isActive: true,
      currentRoundNumber: 1,
    });
    const savedGame = await this.gameRepository.save(game);

    // Create first round
    const round = this.roundRepository.create({
      game: savedGame,
      roundNumber: 1,
    });
    await this.roundRepository.save(round);

    return savedGame;
  }

  async addPlayerToGame(playerId: string, playerInfo?: PlayerInfo): Promise<Game> {
    const game = await this.getActiveGame();
    if (!game) throw new RpcException('No active game found');

    let player = await this.playerRepository.findOne({
      where: { telegramId: playerId },
      relations: ['games']
    });

    if (!player && playerInfo) {
      player = this.playerRepository.create({
        telegramId: playerId,
        username: playerInfo.username,
        displayName: playerInfo.displayName,
        balance: 0,
      });
      player = await this.playerRepository.save(player);
    } else if (!player) {
        throw new RpcException('Player info is required for new player');
    }

    if (game.type === GameType.TIENLEN && game.players?.length >= 4) {
        throw new RpcException('Tiến Lên game already has maximum players');
    }

    if (!game.players) {
      game.players = [];
    }

    game.players.push(player);
    return this.gameRepository.save(game);
  }

  private async getCurrentRound(game: Game): Promise<Round> {
    const round = await this.roundRepository.findOne({
      where: {
        game: { id: game.id },
        roundNumber: game.currentRoundNumber,
      },
      relations: ['scores', 'scores.player'],
    });

    if (!round) {
        throw new RpcException('Current round not found');
    }

    return round;
  }

  private async validateRoundScores(game: Game, round: Round): Promise<void> {
    const totalPoints = round.scores.reduce((sum, score) => sum + Number(score.points), 0);
    
    if (game.type === GameType.POKER && Math.abs(totalPoints) > 0.01) {
      throw new RpcException('Total points in Poker must be 0');
    }

    if (game.type === GameType.TIENLEN && Math.abs(totalPoints - 6) > 0.01) {
      throw new RpcException('Total points in Tiến Lên must be 6');
    }
  }

  async recordScore(playerId: string, points: number, rank?: number): Promise<{ playerScores: PlayerScore[] }> {
    const game = await this.getActiveGame();
    if (!game) throw new RpcException('No active game found');

    const player = await this.playerRepository.findOne({
      where: { telegramId: playerId },
    });
    if (!player) throw new RpcException('Player not found');

    const round = await this.getCurrentRound(game);
    
    // Check if player already scored in this round
    let existingScore = round.scores.find(score => score.player.id === player.id);
    const amount = points * (game.metadata?.pointValue ?? 1);

    if (existingScore) {
      // Update existing score
      existingScore.points = points;
      existingScore.amount = amount;
      existingScore.metadata = { ...existingScore.metadata, rank };
      await this.scoreRepository.save(existingScore);
    } else {
      // Create new score
      existingScore = this.scoreRepository.create({
        game,
        round,
        player,
        points,
        amount,
        roundNumber: game.currentRoundNumber,
        metadata: { rank },
      });
      await this.scoreRepository.save(existingScore);
    }

    // Refresh round data
    const updatedRound = await this.getCurrentRound(game);

    // Check if all players have scored
    if (updatedRound.scores.length === game.players.length) {
      // Validate total points
      await this.validateRoundScores(game, updatedRound);

      // Complete current round
      updatedRound.isCompleted = true;
      updatedRound.completedAt = new Date();
      await this.roundRepository.save(updatedRound);

      // Create new round
      game.currentRoundNumber += 1;
      await this.gameRepository.save(game);

      const newRound = this.roundRepository.create({
        game,
        roundNumber: game.currentRoundNumber,
      });
      await this.roundRepository.save(newRound);
    }

    // Return all player scores for the current round
    return {
      playerScores: updatedRound.scores.map(score => ({
        playerId: score.player.telegramId,
        totalPoints: Number(score.points),
        playerName: score.player.displayName || score.player.username || `Player ${score.player.telegramId}`,
      }))
    };
  }

  async getCurrentScores(): Promise<CurrentScore[]> {
    const game = await this.getActiveGame();
    if (!game) throw new RpcException('No active game found');

    const round = await this.getCurrentRound(game);
    return round.scores.map(score => ({
      playerId: score.player.telegramId,
      points: Number(score.points)
    }));
  }

  async endGame(): Promise<Game> {
    const game = await this.getActiveGame();
    if (!game) throw new RpcException('No active game found');

    game.isActive = false;
    game.endedAt = new Date();
    return this.gameRepository.save(game);
  }

  async getTotalScores(): Promise<PlayerTotalScore[]> {
    const game = await this.getActiveGame();
    if (!game) throw new RpcException('No active game found');

    // Load all scores for the active game with player info
    const scores = await this.scoreRepository.find({
      where: {
        game: { id: game.id }
      },
      relations: ['player', 'game'],
    });

    // Group scores by player
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

    // Convert map to array and sort
    const playerScores = Array.from(playerScoresMap.entries()).map(([playerId, data]) => ({
      playerId,
      playerName: data.name,
      totalPoints: Number(data.points.toFixed(2)) // Round to 2 decimal places
    }));

    // Sort by total points in descending order
    return playerScores.sort((a, b) => b.totalPoints - a.totalPoints);
  }
}

