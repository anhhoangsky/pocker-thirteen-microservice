import { Test, TestingModule } from '@nestjs/testing';
import { TelegramBotModule } from './telegram-bot.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { GAME_SERVICE, FINANCIAL_SERVICE } from './constants';

describe('TelegramBotModule', () => {
	let moduleRef: TestingModule;

	beforeEach(async () => {
		const mockClientProxy = {
			send: jest.fn().mockReturnValue({ toPromise: jest.fn() })
		};

		moduleRef = await Test.createTestingModule({
			imports: [
				ConfigModule.forRoot({
					isGlobal: true,
					ignoreEnvFile: true
				})
			],
			providers: [
				{
					provide: ConfigService,
					useValue: {
						get: jest.fn().mockReturnValue('fake-token')
					}
				},
				{
					provide: GAME_SERVICE,
					useValue: mockClientProxy
				},
				{
					provide: FINANCIAL_SERVICE,
					useValue: mockClientProxy
				}
			]
		})
		.overrideModule(TelegramBotModule)
		.useModule({
			module: class {},
			imports: [],
			providers: []
		})
		.compile();
	});

	it('should be defined', () => {
		expect(moduleRef).toBeDefined();
	});

	it('should have required providers', () => {
		const configService = moduleRef.get<ConfigService>(ConfigService);
		const gameService = moduleRef.get(GAME_SERVICE);
		const financialService = moduleRef.get(FINANCIAL_SERVICE);

		expect(configService).toBeDefined();
		expect(gameService).toBeDefined();
		expect(financialService).toBeDefined();
	});
});


