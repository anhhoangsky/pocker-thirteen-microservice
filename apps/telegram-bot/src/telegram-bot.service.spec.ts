import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { TelegramBotService } from './telegram-bot.service';
import { Telegraf } from 'telegraf';

jest.mock('telegraf', () => {
	return {
		Telegraf: jest.fn().mockImplementation(() => ({
			launch: jest.fn().mockResolvedValue(undefined),
			command: jest.fn(),
			on: jest.fn(),
			use: jest.fn()
		}))
	};
});

describe('TelegramBotService', () => {
		let service: TelegramBotService;
		let mockConfigService: jest.Mocked<ConfigService>;
		let mockGameService: any;
		let mockFinancialService: any;

		beforeEach(async () => {
				mockConfigService = {
						get: jest.fn().mockReturnValue('test-token')
				} as any;

				mockGameService = {
						send: jest.fn().mockReturnValue({
								toPromise: jest.fn().mockResolvedValue({ gameId: '123' })
						})
				};

				mockFinancialService = {
						send: jest.fn().mockReturnValue({
								toPromise: jest.fn().mockResolvedValue({})
						})
				};

				const moduleRef: TestingModule = await Test.createTestingModule({
						providers: [
								TelegramBotService,
								{
										provide: ConfigService,
										useValue: mockConfigService
								},
								{
										provide: 'GAME_SERVICE',
										useValue: mockGameService
								},
								{
										provide: 'FINANCIAL_SERVICE',
										useValue: mockFinancialService
								}
						]
				}).compile();

				service = moduleRef.get<TelegramBotService>(TelegramBotService);
	});

	describe('initialization', () => {
		it('should initialize bot with token', async () => {
			mockConfigService.get.mockReturnValue('test-token');
			await service.onModuleInit();
			expect(mockConfigService.get).toHaveBeenCalledWith('TELEGRAM_BOT_TOKEN');
			expect(Telegraf).toHaveBeenCalledWith('test-token');
		});

		it('should throw error if token not provided', async () => {
			mockConfigService.get.mockReturnValue(null);
			await expect(service.onModuleInit()).rejects.toThrow('TELEGRAM_BOT_TOKEN is not defined');
		});
	});

	describe('commands', () => {
		beforeEach(async () => {
			mockConfigService.get.mockReturnValue('test-token');
			await service.onModuleInit();
		});

		it('should handle /start command', () => {
			const ctx = { reply: jest.fn() };
			service['handleStart'](ctx);
			expect(ctx.reply).toHaveBeenCalledWith(
				'Welcome to Poker & Tiến Lên Manager Bot! Use /help to see available commands.'
			);
		});

		it('should handle /newgame command', async () => {
			const ctx = {
				message: { text: '/newgame poker' },
				reply: jest.fn()
			};
			await service['handleNewGame'](ctx);
			expect(ctx.reply).toHaveBeenCalledWith('New poker game created! Game ID: 123');
		});

		it('should handle /help command', () => {
			const ctx = { reply: jest.fn() };
			service['handleHelp'](ctx);
			expect(ctx.reply).toHaveBeenCalledWith(expect.stringContaining('Available commands:'));
		});
	});
});


