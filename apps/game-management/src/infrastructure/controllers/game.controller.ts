import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { GameService } from '../../application/services/game.service';
import { GameType } from '../../domain/entities/game.entity';
import { PlayerScore } from '../../domain/interfaces/player-score.interface';


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
  async joinGame(
    @Payload() data: { 
      playerId: string;
      playerInfo?: {
        username: string;
        displayName?: string;
      }
    }
  ) {
    return this.gameService.addPlayerToGame(data.playerId, data.playerInfo);
  }

  @MessagePattern({ cmd: 'record_score' })
  async recordScore(
    @Payload() data: { playerId: string; points: number; rank?: number },
  ): Promise<{ playerScores: PlayerScore[] }> {
    return this.gameService.recordScore(data.playerId, data.points, data.rank);
  }

  @MessagePattern({ cmd: 'end_game' })
  async endGame() {
    return this.gameService.endGame();
  }

  @MessagePattern({ cmd: 'get_total_scores' })
  async getTotalScores(): Promise<{ playerScores: PlayerScore[] }> {
    const scores = await this.gameService.getTotalScores();
    return { playerScores: scores };
  }

}
