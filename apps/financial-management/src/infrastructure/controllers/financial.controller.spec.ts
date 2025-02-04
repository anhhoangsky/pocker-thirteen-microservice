import { Test, TestingModule } from '@nestjs/testing';
import { FinancialController } from './financial.controller';
import { FinancialService } from '../../application/services/financial.service';
import { TransactionType } from '../../domain/entities/transaction.entity';

describe('FinancialController', () => {
	let controller: FinancialController;
	let financialService: jest.Mocked<FinancialService>;

	beforeEach(async () => {
		const mockFinancialService = {
			recordGameTransaction: jest.fn(),
			getPlayerBalance: jest.fn(),
			getReport: jest.fn(),
			depositToFund: jest.fn(),
			createFund: jest.fn()
		};

		const module: TestingModule = await Test.createTestingModule({
			controllers: [FinancialController],
			providers: [
				{
					provide: FinancialService,
					useValue: mockFinancialService
				}
			]
		}).compile();

		controller = module.get<FinancialController>(FinancialController);
		financialService = module.get(FinancialService);
	});

	describe('recordGameTransaction', () => {
		it('should record game transaction', async () => {
			const mockTransaction = {
				id: '123',
				playerId: 'player-123',
				gameId: 'game-123',
				amount: 1000,
				type: TransactionType.GAME_SETTLEMENT,
				createdAt: new Date(),
				fund: null,
				metadata: {}
			};
			financialService.recordGameTransaction.mockResolvedValue(mockTransaction);

			const result = await controller.recordGameTransaction({
				playerId: 'player-123',
				gameId: 'game-123',
				amount: 1000,
				metadata: {}
			});

			expect(result).toEqual(mockTransaction);
			expect(financialService.recordGameTransaction).toHaveBeenCalledWith(
				'player-123',
				'game-123',
				1000,
				{}
			);
		});
	});

	describe('getPlayerBalance', () => {
		it('should get player balance', async () => {
			const mockBalance = 1000;
			financialService.getPlayerBalance.mockResolvedValue(mockBalance);

			const result = await controller.getPlayerBalance({ playerId: 'player-123' });
			
			expect(result).toBe(mockBalance);
			expect(financialService.getPlayerBalance).toHaveBeenCalledWith('player-123');
		});
	});

	describe('getReport', () => {
		it('should get financial report', async () => {
			const mockReport = {
				balance: 1000,
				transactions: [
					{
						id: '123',
						playerId: 'player-123',
						amount: 1000,
						type: TransactionType.GAME_SETTLEMENT,
						createdAt: new Date(),
						gameId: null,
						fund: null,
						metadata: {}
					}
				]
			};
			financialService.getReport.mockResolvedValue(mockReport);

			const result = await controller.getReport({
				playerId: 'player-123',
				startDate: '2023-01-01',
				endDate: '2023-12-31'
			});

			expect(result).toEqual(mockReport);
			expect(financialService.getReport).toHaveBeenCalledWith(
				'player-123',
				new Date('2023-01-01'),
				new Date('2023-12-31')
			);
		});
	});

	describe('depositToFund', () => {
		it('should deposit to fund', async () => {
			const mockDeposit = {
				id: '123',
				playerId: 'player-123',
				amount: 1000,
				type: TransactionType.FUND_DEPOSIT,
				createdAt: new Date(),
				gameId: null,
				fund: {
					id: 'fund-123',
					name: 'Test Fund',
					balance: 0,
					createdAt: new Date(),
					lastUpdatedAt: new Date(),
					transactions: [],
					metadata: {
						description: 'Test fund description',
						rules: ['rule1'],
						contributors: []
					}
				},
				metadata: {}
			};
			financialService.depositToFund.mockResolvedValue(mockDeposit);

			const result = await controller.depositToFund({
				playerId: 'player-123',
				amount: 1000,
				fundId: 'fund-123'
			});

			expect(result).toEqual(mockDeposit);
			expect(financialService.depositToFund).toHaveBeenCalledWith(
				'player-123',
				1000,
				'fund-123'
			);
		});
	});

	describe('createFund', () => {
		it('should create fund', async () => {
			const mockFund = {
				id: 'fund-123',
				name: 'Test Fund',
				balance: 0,
				createdAt: new Date(),
				lastUpdatedAt: new Date(),
				transactions: [],
				metadata: {
					description: 'Test fund description',
					rules: ['rule1'],
					contributors: []
				}
			};
			financialService.createFund.mockResolvedValue(mockFund);

			const result = await controller.createFund({
				name: 'Test Fund',
				metadata: { type: 'game' }
			});

			expect(result).toEqual(mockFund);
			expect(financialService.createFund).toHaveBeenCalledWith(
				'Test Fund',
				{ type: 'game' }
			);
		});
	});
});

