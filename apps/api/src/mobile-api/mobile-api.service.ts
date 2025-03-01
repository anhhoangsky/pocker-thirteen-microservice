import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { JwtService } from '@nestjs/jwt';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class MobileApiService {
  private readonly logger = new Logger(MobileApiService.name);

  constructor(
    @Inject('GAME_SERVICE') private readonly gameService: ClientProxy,
    @Inject('FINANCIAL_SERVICE') private readonly financialService: ClientProxy,
    private readonly jwtService: JwtService,
  ) {}

  async generateToken(userId: string, username: string, displayName?: string): Promise<string> {
    const payload = { sub: userId, username, displayName };
    return this.jwtService.sign(payload);
  }

  async createGame(type: string, metadata: any): Promise<any> {
    try {
      return await firstValueFrom(
        this.gameService.send({ cmd: 'create_game' }, { type, metadata })
      );
    } catch (error) {
      this.logger.error(`Error creating game: ${error.message}`, error.stack);
      throw error;
    }
  }

  async joinGame(playerId: string, playerInfo: any): Promise<any> {
    try {
      return await firstValueFrom(
        this.gameService.send({ cmd: 'join_game' }, { playerId, playerInfo })
      );
    } catch (error) {
      this.logger.error(`Error joining game: ${error.message}`, error.stack);
      throw error;
    }
  }

  async recordScore(playerId: string, points: number, rank?: number): Promise<any> {
    try {
      return await firstValueFrom(
        this.gameService.send({ cmd: 'record_score' }, { playerId, points, rank })
      );
    } catch (error) {
      this.logger.error(`Error recording score: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getTotalScores(): Promise<any> {
    try {
      return await firstValueFrom(
        this.gameService.send({ cmd: 'get_total_scores' }, {})
      );
    } catch (error) {
      this.logger.error(`Error getting total scores: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getCurrentRound(): Promise<any> {
    try {
      return await firstValueFrom(
        this.gameService.send({ cmd: 'get_current_round' }, {})
      );
    } catch (error) {
      this.logger.error(`Error getting current round: ${error.message}`, error.stack);
      throw error;
    }
  }

  async endGame(): Promise<any> {
    try {
      return await firstValueFrom(
        this.gameService.send({ cmd: 'end_game' }, {})
      );
    } catch (error) {
      this.logger.error(`Error ending game: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getBalance(userId: string): Promise<any> {
    try {
      return await firstValueFrom(
        this.financialService.send({ cmd: 'get_balance' }, { userId })
      );
    } catch (error) {
      this.logger.error(`Error getting balance: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getReport(userId: string, type: string): Promise<any> {
    try {
      return await firstValueFrom(
        this.financialService.send({ cmd: 'get_report' }, { userId, type })
      );
    } catch (error) {
      this.logger.error(`Error getting report: ${error.message}`, error.stack);
      throw error;
    }
  }
}