import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { GameService } from './game.service';
import { Game, GameType } from '../../domain/entities/game.entity';
import { Player } from '../../domain/entities/player.entity';
import { GameScore } from '../../domain/entities/game-score.entity';
import { NotFoundException } from '@nestjs/common';
import { createMockRepository } from '@test/mocks/repository.mock';
import { Repository } from 'typeorm';

describe('GameService', () => {
	let service: GameService;
	let gameRepository: ReturnType<typeof createMockRepository>;
	let playerRepository: ReturnType<typeof createMockRepository>;
	let scoreRepository: ReturnType<typeof createMockRepository>;

	beforeEach(async () => {
		gameRepository = createMockRepository<Game>();
		playerRepository = createMockRepository<Player>();
		scoreRepository = createMockRepository<GameScore>();

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				GameService,
				{
					provide: getRepositoryToken(Game),
					useValue: gameRepository
				},
				{
					provide: getRepositoryToken(Player),
					useValue: playerRepository
				},
				{
					provide: getRepositoryToken(GameScore),
					useValue: scoreRepository
				}
			]
		}).compile();

		service = module.get<GameService>(GameService);
	});


	describe('createGame', () => {
		it('should create a new game', async () => {
			const mockGame: Game = {
				id: '123',
				type: GameType.POKER,
				metadata: { pointValue: 1000 },
				isActive: true,
				createdAt: new Date(),
				players: [],
				scores: []
			} as Game;

			gameRepository.create.mockReturnValue(mockGame);
			gameRepository.save.mockResolvedValue(mockGame);

			const result = await service.createGame(GameType.POKER, { pointValue: 1000 });
			expect(result).toEqual(mockGame);
		});
	});


	describe('addPlayerToGame', () => {
		const mockGame: Game = {
			id: '123',
			type: GameType.POKER,
			players: [],
			isActive: true,
			createdAt: new Date(),
			scores: [],
			metadata: {}
		} as Game;

		const mockPlayer: Player = {
			id: '456',
			username: 'testplayer'
		} as Player;

		it('should add player to game', async () => {
			gameRepository.findOne.mockResolvedValue(mockGame);
			playerRepository.findOne.mockResolvedValue(mockPlayer);
			gameRepository.save.mockResolvedValue({ ...mockGame, players: [mockPlayer] });

			const result = await service.addPlayerToGame('123', '456');
			expect(result.players).toContain(mockPlayer);
		});

		it('should throw NotFoundException if game not found', async () => {
			gameRepository.findOne.mockResolvedValue(null);
			await expect(service.addPlayerToGame('123', '456'))
				.rejects.toThrow(NotFoundException);
		});

		it('should throw NotFoundException if player not found', async () => {
			gameRepository.findOne.mockResolvedValue(mockGame);
			playerRepository.findOne.mockResolvedValue(null);
			await expect(service.addPlayerToGame('123', '456'))
				.rejects.toThrow(NotFoundException);
		});

		it('should throw error when adding player to full TIENLEN game', async () => {
			const tienlenGame: Game = {
				id: '123',
				type: GameType.TIENLEN,
				players: Array(4).fill(mockPlayer),
				isActive: true,
				createdAt: new Date(),
				scores: [],
				metadata: {}
			} as Game;

			gameRepository.findOne.mockResolvedValue(tienlenGame);
			playerRepository.findOne.mockResolvedValue(mockPlayer);

			await expect(service.addPlayerToGame('123', '456'))
				.rejects.toThrow('Tiến Lên game already has maximum players');
		});

		it('should initialize players array if undefined', async () => {
			const gameWithoutPlayers: Game = {
				id: '123',
				type: GameType.POKER,
				isActive: true,
				createdAt: new Date(),
				scores: [],
				metadata: {}
			} as Game;

			gameRepository.findOne.mockResolvedValue(gameWithoutPlayers);
			playerRepository.findOne.mockResolvedValue(mockPlayer);
			gameRepository.save.mockImplementation(game => Promise.resolve(game));

			const result = await service.addPlayerToGame('123', '456');
			expect(result.players).toBeDefined();
			expect(result.players).toContain(mockPlayer);
		});
	});

	describe('recordScore', () => {
		const mockGame: Game = {
			id: '123',
			type: GameType.POKER,
			metadata: { pointValue: 1000 },
			players: [],
			isActive: true,
			createdAt: new Date(),
			scores: []
		} as Game;

		const mockPlayer: Player = {
			id: '456'
		} as Player;

		it('should record score successfully', async () => {
			gameRepository.findOne.mockResolvedValue(mockGame);
			playerRepository.findOne.mockResolvedValue(mockPlayer);
			
			const scoreData: GameScore = {
				id: '789',
				game: mockGame,
				player: mockPlayer,
				points: 10,
				amount: 10000
			} as GameScore;
			
			scoreRepository.create.mockReturnValue(scoreData);
			scoreRepository.save.mockResolvedValue(scoreData);

			const result = await service.recordScore('123', '456', 10);
			expect(result.points).toBe(10);
			expect(result.amount).toBe(10000);
		});

		it('should use default pointValue when metadata.pointValue is not set', async () => {
			const gameWithoutPointValue: Game = {
				id: '123',
				type: GameType.POKER,
				metadata: {},
				players: [],
				isActive: true,
				createdAt: new Date(),
				scores: []
			} as Game;

			gameRepository.findOne.mockResolvedValue(gameWithoutPointValue);
			playerRepository.findOne.mockResolvedValue(mockPlayer);

			const scoreData: GameScore = {
				id: '789',
				game: gameWithoutPointValue,
				player: mockPlayer,
				points: 10,
				amount: 10 // points * default pointValue (1)
			} as GameScore;

			scoreRepository.create.mockReturnValue(scoreData);
			scoreRepository.save.mockResolvedValue(scoreData);

			const result = await service.recordScore('123', '456', 10);
			expect(result.amount).toBe(10); // points * 1
		});

		it('should record score with rank', async () => {
			const mockRank = 1;
			gameRepository.findOne.mockResolvedValue(mockGame);
			playerRepository.findOne.mockResolvedValue(mockPlayer);

			const scoreData: GameScore = {
				id: '789',
				game: mockGame,
				player: mockPlayer,
				points: 10,
				amount: 10000,
				metadata: { rank: mockRank }
			} as GameScore;

			scoreRepository.create.mockReturnValue(scoreData);
			scoreRepository.save.mockResolvedValue(scoreData);

			const result = await service.recordScore('123', '456', 10, mockRank);
			expect(result.metadata.rank).toBe(mockRank);
		});
	});

	describe('endGame', () => {
		it('should end game successfully', async () => {
			const mockGame: Game = {
				id: '123',
				isActive: true,
				type: GameType.POKER,
				players: [],
				createdAt: new Date(),
				scores: [],
				metadata: {}
			} as Game;

			gameRepository.findOne.mockResolvedValue(mockGame);
			gameRepository.save.mockImplementation(game => Promise.resolve({ ...game, isActive: false, endedAt: new Date() }));

			const result = await service.endGame('123');
			expect(result.isActive).toBe(false);
			expect(result.endedAt).toBeDefined();
		});
	});
});
