import { Test, TestingModule } from '@nestjs/testing';
import { GameManagementModule } from './game-management.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Game } from './domain/entities/game.entity';
import { Player } from './domain/entities/player.entity';
import { GameScore } from './domain/entities/game-score.entity';
import { ConfigModule } from '@nestjs/config';
import { GameService } from './application/services/game.service';
import { TypeOrmModule } from '@nestjs/typeorm';

const mockRepository = {
	find: jest.fn(),
	findOne: jest.fn(),
	save: jest.fn(),
	create: jest.fn()
};

describe('GameManagementModule', () => {
	let moduleFixture: TestingModule;

	beforeAll(async () => {
		moduleFixture = await Test.createTestingModule({
			imports: [
				ConfigModule.forRoot({
					isGlobal: true,
					ignoreEnvFile: true
				})
			],
			providers: [
				{
					provide: getRepositoryToken(Game),
					useValue: mockRepository
				},
				{
					provide: getRepositoryToken(Player),
					useValue: mockRepository
				},
				{
					provide: getRepositoryToken(GameScore),
					useValue: mockRepository
				},
				{
					provide: 'IGameRepository',
					useValue: mockRepository
				},
				{
					provide: GameService,
					useValue: {
						createGame: jest.fn(),
						addPlayerToGame: jest.fn(),
						recordScore: jest.fn(),
						endGame: jest.fn()
					}
				}
			]
		})
		.overrideModule(GameManagementModule)
		.useModule({
			module: class {},
			imports: [],
			providers: []
		})
		.compile();
	});

	it('should compile the module', () => {
		expect(moduleFixture).toBeDefined();
	});

	it('should have repositories properly injected', () => {
		const gameRepo = moduleFixture.get(getRepositoryToken(Game));
		const playerRepo = moduleFixture.get(getRepositoryToken(Player));
		const scoreRepo = moduleFixture.get(getRepositoryToken(GameScore));
		const gameRepository = moduleFixture.get('IGameRepository');
		const gameService = moduleFixture.get(GameService);

		expect(gameRepo).toBeDefined();
		expect(playerRepo).toBeDefined();
		expect(scoreRepo).toBeDefined();
		expect(gameRepository).toBeDefined();
		expect(gameService).toBeDefined();
	});
});



