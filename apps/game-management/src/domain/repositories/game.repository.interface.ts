import { Game, GameType } from '../entities/game.entity';
import { Player } from '../entities/player.entity';

export interface IGameRepository {
  create(type: GameType, metadata: any): Promise<Game>;
  findById(id: string): Promise<Game>;
  findByIdWithPlayers(id: string): Promise<Game>;
  addPlayer(game: Game, player: Player): Promise<Game>;
  update(game: Game): Promise<Game>;
  findActiveGames(): Promise<Game[]>;
}
