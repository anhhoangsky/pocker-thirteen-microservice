import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { FinancialService } from '../../application/services/financial.service';

@Controller()
export class FinancialController {
  constructor(private readonly financialService: FinancialService) {}

  @MessagePattern({ cmd: 'record_game_transaction' })
  async recordGameTransaction(
    @Payload() data: { playerId: string; gameId: string; amount: number; metadata: any },
  ) {
    return this.financialService.recordGameTransaction(
      data.playerId,
      data.gameId,
      data.amount,
      data.metadata,
    );
  }

  @MessagePattern({ cmd: 'get_player_balance' })
  async getPlayerBalance(@Payload() data: { playerId: string }) {
    return this.financialService.getPlayerBalance(data.playerId);
  }

  @MessagePattern({ cmd: 'get_report' })
  async getReport(@Payload() data: { playerId: string; startDate: string; endDate: string }) {
    return this.financialService.getReport(
      data.playerId,
      new Date(data.startDate),
      new Date(data.endDate),
    );
  }

  @MessagePattern({ cmd: 'deposit_to_fund' })
  async depositToFund(@Payload() data: { playerId: string; amount: number; fundId: string }) {
    return this.financialService.depositToFund(data.playerId, data.amount, data.fundId);
  }

  @MessagePattern({ cmd: 'create_fund' })
  async createFund(@Payload() data: { name: string; metadata?: any }) {
    return this.financialService.createFund(data.name, data.metadata);
  }
}
