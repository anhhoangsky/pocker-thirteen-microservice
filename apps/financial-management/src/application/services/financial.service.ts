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

  // New methods for reporting system
  async getFinancialReport(
    startDate: Date,
    endDate: Date,
    playerId?: string,
  ): Promise<{
    totalAmount: number;
    transactionCount: number;
    transactions: Transaction[];
    summary: {
      byType: Record<string, { count: number; total: number }>;
      byDay: Record<string, { count: number; total: number }>;
    };
  }> {
    const whereClause: any = {
      createdAt: Between(startDate, endDate),
    };

    if (playerId) {
      whereClause.playerId = playerId;
    }

    const transactions = await this.transactionRepository.find({
      where: whereClause,
      relations: ['fund'],
      order: { createdAt: 'DESC' },
    });

    const totalAmount = transactions.reduce((sum, tx) => sum + Number(tx.amount), 0);
    
    // Group by transaction type
    const byType: Record<string, { count: number; total: number }> = {};
    
    // Group by day
    const byDay: Record<string, { count: number; total: number }> = {};
    
    transactions.forEach(tx => {
      // Process by type
      const type = tx.type;
      if (!byType[type]) {
        byType[type] = { count: 0, total: 0 };
      }
      byType[type].count++;
      byType[type].total += Number(tx.amount);
      
      // Process by day
      const day = tx.createdAt.toISOString().split('T')[0];
      if (!byDay[day]) {
        byDay[day] = { count: 0, total: 0 };
      }
      byDay[day].count++;
      byDay[day].total += Number(tx.amount);
    });

    return {
      totalAmount,
      transactionCount: transactions.length,
      transactions,
      summary: {
        byType,
        byDay,
      },
    };
  }

  async getPlayerTransactions(
    playerId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<{
    totalAmount: number;
    transactionCount: number;
    transactions: Transaction[];
    gameTransactions: Transaction[];
    fundTransactions: Transaction[];
  }> {
    const whereClause: any = {
      playerId,
    };

    if (startDate && endDate) {
      whereClause.createdAt = Between(startDate, endDate);
    }

    const transactions = await this.transactionRepository.find({
      where: whereClause,
      relations: ['fund'],
      order: { createdAt: 'DESC' },
    });

    const totalAmount = transactions.reduce((sum, tx) => sum + Number(tx.amount), 0);
    
    // Separate game and fund transactions
    const gameTransactions = transactions.filter(tx => tx.type === TransactionType.GAME_SETTLEMENT);
    const fundTransactions = transactions.filter(tx => 
      tx.type === TransactionType.FUND_DEPOSIT || tx.type === TransactionType.FUND_WITHDRAWAL
    );

    return {
      totalAmount,
      transactionCount: transactions.length,
      transactions,
      gameTransactions,
      fundTransactions,
    };
  }

  async getFunds(): Promise<Fund[]> {
    return this.fundRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async getFundTransactions(
    fundId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<{
    fund: Fund;
    transactions: Transaction[];
    totalDeposits: number;
    totalWithdrawals: number;
  }> {
    const fund = await this.fundRepository.findOne({ where: { id: fundId } });
    if (!fund) throw new NotFoundException('Fund not found');

    const whereClause: any = {
      fund: { id: fundId },
    };

    if (startDate && endDate) {
      whereClause.createdAt = Between(startDate, endDate);
    }

    const transactions = await this.transactionRepository.find({
      where: whereClause,
      order: { createdAt: 'DESC' },
    });

    const totalDeposits = transactions
      .filter(tx => tx.type === TransactionType.FUND_DEPOSIT)
      .reduce((sum, tx) => sum + Number(tx.amount), 0);

    const totalWithdrawals = transactions
      .filter(tx => tx.type === TransactionType.FUND_WITHDRAWAL)
      .reduce((sum, tx) => sum + Number(tx.amount), 0);

    return {
      fund,
      transactions,
      totalDeposits,
      totalWithdrawals,
    };
  }
}