import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FinancialService } from './financial.service';
import { Transaction, TransactionType } from '../../domain/entities/transaction.entity';
import { Fund } from '../../domain/entities/fund.entity';
import { NotFoundException } from '@nestjs/common';

describe('FinancialService', () => {
		let service: FinancialService;
		let mockTransactionRepo: jest.Mocked<Repository<Transaction>>;
		let mockFundRepo: jest.Mocked<Repository<Fund>>;

		beforeEach(async () => {
				mockTransactionRepo = {
						create: jest.fn(),
						save: jest.fn(),
						find: jest.fn(),
						findOne: jest.fn()
				} as any;

				mockFundRepo = {
						findOne: jest.fn(),
						save: jest.fn()
				} as any;

				const moduleFixture = await Test.createTestingModule({
						providers: [
								FinancialService,
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

				service = moduleFixture.get<FinancialService>(FinancialService);
	});

	describe('recordGameTransaction', () => {
		it('should record game transaction', async () => {
			const transactionData = {
				playerId: '123',
				gameId: '456',
				amount: 1000,
				type: TransactionType.GAME_SETTLEMENT,
				metadata: { description: 'Game settlement' }
			};

			mockTransactionRepo.create.mockReturnValue(transactionData as Transaction);
			mockTransactionRepo.save.mockResolvedValue({ ...transactionData, id: '789' } as Transaction);

			const result = await service.recordGameTransaction('123', '456', 1000, { description: 'Game settlement' });
			expect(result.id).toBe('789');
		});
	});

	describe('depositToFund', () => {
		it('should deposit amount to fund', async () => {
			const fund = {
				id: '123',
				balance: 1000,
				name: 'Test Fund'
			} as Fund;

			const expectedTransaction = {
				id: '789',
				playerId: '456',
				amount: 500,
				type: TransactionType.FUND_DEPOSIT,
				fund,
				metadata: { description: 'Deposit to Test Fund' }
			} as Transaction;

			mockFundRepo.findOne.mockResolvedValue(fund);
			mockFundRepo.save.mockResolvedValue({ ...fund, balance: 1500 } as Fund);
			mockTransactionRepo.create.mockReturnValue(expectedTransaction);
			mockTransactionRepo.save.mockResolvedValue(expectedTransaction);

			const result = await service.depositToFund('456', 500, '123');
			expect(result.id).toBe('789');
			expect(result.amount).toBe(500);
			expect(result.type).toBe(TransactionType.FUND_DEPOSIT);
		});

		it('should throw NotFoundException if fund not found', async () => {
			mockFundRepo.findOne.mockResolvedValue(null);
			await expect(service.depositToFund('456', 500, '123')).rejects.toThrow(NotFoundException);
		});
	});

	describe('getPlayerBalance', () => {
		it('should calculate player balance', async () => {
			const transactions = [
				{ amount: 1000 },
				{ amount: -200 }
			] as Transaction[];

			mockTransactionRepo.find.mockResolvedValue(transactions);

			const balance = await service.getPlayerBalance('123');
			expect(balance).toBe(800);
		});
	});

	describe('getReport', () => {
		it('should generate player report', async () => {
			const startDate = new Date('2023-01-01');
			const endDate = new Date('2023-12-31');
			const transactions = [
				{ amount: 1000 },
				{ amount: -500 }
			] as Transaction[];

			mockTransactionRepo.find.mockResolvedValue(transactions);

			const report = await service.getReport('123', startDate, endDate);
			expect(report.balance).toBe(500);
			expect(report.transactions).toEqual(transactions);
		});
	});
});
