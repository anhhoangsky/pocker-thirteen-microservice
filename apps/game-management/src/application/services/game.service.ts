import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Game, GameType } from '../../domain/entities/game.entity';
import { Player } from '../../domain/entities/player.entity';
import { GameScore } from '../../domain/entities/game-score.entity';

@Injectable()
export class GameService {
  constructor(
    @InjectRepository(Game)
    private readonly gameRepository: Repository<Game>,
    @InjectRepository(Player)
    private readonly playerRepository: Repository<Player>,
    @InjectRepository(GameScore)
    private readonly scoreRepository: Repository<GameScore>,
  ) {}

  async createGame(type: GameType, metadata: any): Promise<Game> {
    const game = this.gameRepository.create({
      type,
      metadata,
      isActive: true,
    });
    return this.gameRepository.save(game);
  }

  async addPlayerToGame(gameId: string, playerId: string): Promise<Game> {
    const game = await this.gameRepository.findOne({
      where: { id: gameId },
      relations: ['players'],
    });
    if (!game) throw new NotFoundException('Game not found');

    const player = await this.playerRepository.findOne({
      where: { id: playerId },
    });
    if (!player) throw new NotFoundException('Player not found');

    if (game.type === GameType.TIENLEN && game.players?.length >= 4) {
      throw new Error('Tiến Lên game already has maximum players');
    }

    if (!game.players) {
      game.players = [];
    }

    game.players.push(player);
    return this.gameRepository.save(game);
  }

  async recordScore(
    gameId: string,
    playerId: string,
    points: number,
    rank?: number,
  ): Promise<GameScore> {
    const game = await this.gameRepository.findOne({
      where: { id: gameId },
      relations: ['players'],
    });
    if (!game) throw new NotFoundException('Game not found');

    const player = await this.playerRepository.findOne({
      where: { id: playerId },
    });
    if (!player) throw new NotFoundException('Player not found');

    const amount = points * (game.metadata?.pointValue ?? 1);
    const score = this.scoreRepository.create({
      game,
      player,
      points,
      amount,
      metadata: { rank },
    });

    return this.scoreRepository.save(score);
  }

  async endGame(gameId: string): Promise<Game> {
    const game = await this.gameRepository.findOne({
      where: { id: gameId },
    });
    if (!game) throw new NotFoundException('Game not found');

    game.isActive = false;
    game.endedAt = new Date();
    return this.gameRepository.save(game);
  }
}
