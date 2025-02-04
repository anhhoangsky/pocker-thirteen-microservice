import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from '../../domain/entities/transaction.entity';
import { Fund } from '../../domain/entities/fund.entity';

@Injectable()
export class FinancialRepository {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(Fund)
    private readonly fundRepository: Repository<Fund>,
  ) {}

  async createTransaction(transaction: Partial<Transaction>): Promise<Transaction> {
    return this.transactionRepository.save(transaction);
  }

  async findTransactionsByPlayerId(playerId: string): Promise<Transaction[]> {
    return this.transactionRepository.find({
      where: { playerId },
      relations: ['fund'],
    });
  }

  async findFundById(fundId: string): Promise<Fund | null> {
    return this.fundRepository.findOne({ where: { id: fundId } });
  }

  async saveFund(fund: Fund): Promise<Fund> {
    return this.fundRepository.save(fund);
  }
}