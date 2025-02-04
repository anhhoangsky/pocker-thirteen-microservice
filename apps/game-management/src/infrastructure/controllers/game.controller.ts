import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { GameService } from '../../application/services/game.service';
import { GameType } from '../../domain/entities/game.entity';

@Controller()
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @MessagePattern({ cmd: 'create_game' })
  async createGame(@Payload() data: { type: string; metadata: { maxPlayers: number } }) {
    const gameType = data.type.toLowerCase() === 'poker' ? GameType.POKER : GameType.TIENLEN;
    const metadata = {
      initialPoints: gameType === GameType.POKER ? 500 : 0,
      pointValue: gameType === GameType.POKER ? 0.1 : 1, // 10 points = 1000 VND for poker
      maxPlayers: gameType === GameType.TIENLEN ? 4 : undefined,
    };

    return this.gameService.createGame(gameType, metadata);
  }

  @MessagePattern({ cmd: 'join_game' })
  async joinGame(@Payload() data: { gameId: string; playerId: string }) {
    return this.gameService.addPlayerToGame(data.gameId, data.playerId);
  }

  @MessagePattern({ cmd: 'record_score' })
  async recordScore(
    @Payload() data: { gameId: string; playerId: string; points: number; rank?: number },
  ) {
    return this.gameService.recordScore(data.gameId, data.playerId, data.points, data.rank);
  }

  @MessagePattern({ cmd: 'end_game' })
  async endGame(@Payload() data: { gameId: string }) {
    return this.gameService.endGame(data.gameId);
  }
}