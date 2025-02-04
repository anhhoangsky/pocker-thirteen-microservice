import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FinancialRepository } from './financial.repository';
import { Transaction, TransactionType } from '../../domain/entities/transaction.entity';
import { Fund } from '../../domain/entities/fund.entity';

describe('FinancialRepository', () => {
  let repository: FinancialRepository;
  let mockTransactionRepo: jest.Mocked<Repository<Transaction>>;
  let mockFundRepo: jest.Mocked<Repository<Fund>>;

  const mockTransaction: Transaction = {
    id: 'mock-id',
    playerId: 'player-id',
    amount: 100,
    type: TransactionType.GAME_SETTLEMENT,
    createdAt: new Date(),
    gameId: 'game-id',
    fund: {} as Fund,
    metadata: {}
  };

  const mockFund: Fund = {
    id: 'fund-id',
    name: 'Test Fund',
    balance: 1000,
    createdAt: new Date(),
    lastUpdatedAt: new Date(),
    transactions: [],
    metadata: {}
  };

  beforeEach(async () => {
    mockTransactionRepo = {
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn()
    } as any;

    mockFundRepo = {
      save: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn()
    } as any;

    const moduleFixture = await Test.createTestingModule({
      providers: [
      FinancialRepository,
      {
        provide: getRepositoryToken(Transaction),
        useValue: mockTransactionRepo
      },
      {
        provide: getRepositoryToken(Fund),
        useValue: mockFundRepo
      }
      ]
    }).compile();

    repository = moduleFixture.get<FinancialRepository>(FinancialRepository);
  });

  describe('createTransaction', () => {
    it('should create a transaction', async () => {
      mockTransactionRepo.save.mockResolvedValue(mockTransaction);

      const result = await repository.createTransaction(mockTransaction);
      expect(result).toEqual(mockTransaction);
      expect(mockTransactionRepo.save).toHaveBeenCalledWith(mockTransaction);
    });
  });

  describe('findTransactionsByPlayerId', () => {
    it('should find transactions by player id', async () => {
      const transactions = [mockTransaction];
      mockTransactionRepo.find.mockResolvedValue(transactions);

      const result = await repository.findTransactionsByPlayerId('player-id');
      expect(result).toEqual(transactions);
      expect(mockTransactionRepo.find).toHaveBeenCalledWith({
        where: { playerId: 'player-id' },
        relations: ['fund']
      });
    });
  });

  describe('findFundById', () => {
    it('should find fund by id', async () => {
      mockFundRepo.findOne.mockResolvedValue(mockFund);

      const result = await repository.findFundById('fund-id');
      expect(result).toEqual(mockFund);
      expect(mockFundRepo.findOne).toHaveBeenCalledWith({
        where: { id: 'fund-id' }
      });
    });

    it('should return null if fund not found', async () => {
      mockFundRepo.findOne.mockResolvedValue(null);

      const result = await repository.findFundById('non-existent');
      expect(result).toBeNull();
    });
  });

  describe('saveFund', () => {
    it('should save fund', async () => {
      mockFundRepo.save.mockResolvedValue(mockFund);

      const result = await repository.saveFund(mockFund);
      expect(result).toEqual(mockFund);
      expect(mockFundRepo.save).toHaveBeenCalledWith(mockFund);
    });
  });
});
