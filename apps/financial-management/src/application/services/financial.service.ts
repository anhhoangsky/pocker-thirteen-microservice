import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Transaction, TransactionType } from '../../domain/entities/transaction.entity';
import { Fund } from '../../domain/entities/fund.entity';

@Injectable()
export class FinancialService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(Fund)
    private readonly fundRepository: Repository<Fund>,
  ) {}

  async recordGameTransaction(
    playerId: string,
    gameId: string,
    amount: number,
    metadata: any,
  ): Promise<Transaction> {
    const transaction = this.transactionRepository.create({
      playerId,
      gameId,
      type: TransactionType.GAME_SETTLEMENT,
      amount,
      metadata,
    });
    return this.transactionRepository.save(transaction);
  }

  async depositToFund(playerId: string, amount: number, fundId: string): Promise<Transaction> {
    const fund = await this.fundRepository.findOne({ where: { id: fundId } });
    if (!fund) throw new NotFoundException('Fund not found');

    fund.balance += amount;
    fund.lastUpdatedAt = new Date();
    await this.fundRepository.save(fund);

    const transaction = this.transactionRepository.create({
      playerId,
      type: TransactionType.FUND_DEPOSIT,
      amount,
      fund,
      metadata: { description: `Deposit to ${fund.name}` },
    });
    return this.transactionRepository.save(transaction);
  }

  async getPlayerBalance(playerId: string): Promise<number> {
    const transactions = await this.transactionRepository.find({
      where: { playerId },
    });
    return transactions.reduce((sum, tx) => sum + Number(tx.amount), 0);
  }

  async getReport(
    playerId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<{ balance: number; transactions: Transaction[] }> {
    const transactions = await this.transactionRepository.find({
      where: {
        playerId,
        createdAt: Between(startDate, endDate),
      },
      order: { createdAt: 'DESC' },
    });

    const balance = transactions.reduce((sum, tx) => sum + Number(tx.amount), 0);
    return { balance, transactions };
  }

  async createFund(name: string, metadata?: any): Promise<Fund> {
    const fund = this.fundRepository.create({
      name,
      metadata,
      balance: 0,
    });
    return this.fundRepository.save(fund);
  }
}
