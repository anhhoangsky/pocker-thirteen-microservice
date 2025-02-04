import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Game, GameType } from '../../domain/entities/game.entity';
import { Player } from '../../domain/entities/player.entity';
import { IGameRepository } from '../../domain/repositories/game.repository.interface';

@Injectable()
export class GameRepository implements IGameRepository {
  constructor(
    @InjectRepository(Game)
    private readonly repository: Repository<Game>,
  ) {}

  async create(type: GameType, metadata: any): Promise<Game> {
    const game = this.repository.create({
      type,
      metadata,
      isActive: true,
    });
    try {
      return await this.repository.save(game);
    } catch (error) {
      throw new Error(`Failed to save game: ${error.message}`);
    }
  }

  async findById(id: string): Promise<Game> {
    try {
      const game = await this.repository.findOne({ where: { id } });
      if (!game) {
        throw new NotFoundException(`Game with ID ${id} not found`);
      }
      return game;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to find game: ${error.message}`);
    }
  }

  async findByIdWithPlayers(id: string): Promise<Game> {
    try {
      const game = await this.repository.findOne({
        where: { id },
        relations: ['players'],
      });
      if (!game) {
        throw new NotFoundException(`Game with ID ${id} not found`);
      }
      return game;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to find game with players: ${error.message}`);
    }
  }

  async addPlayer(game: Game, player: Player): Promise<Game> {
    try {
      if (!game.players) {
        game.players = [];
      }
      game.players.push(player);
      return await this.repository.save(game);
    } catch (error) {
      throw new Error(`Failed to add player to game: ${error.message}`);
    }
  }

  async update(game: Game): Promise<Game> {
    try {
      return await this.repository.save(game);
    } catch (error) {
      throw new Error(`Failed to update game: ${error.message}`);
    }
  }

  async findActiveGames(): Promise<Game[]> {
    try {
      const games = await this.repository.find({
        where: { isActive: true },
        relations: ['players'],
        order: { createdAt: 'DESC' },
      });
      return games;
    } catch (error) {
      throw new Error(`Failed to find active games: ${error.message}`);
    }
  }
}
