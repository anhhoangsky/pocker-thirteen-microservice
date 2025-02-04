import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GameRepository } from './game.repository';
import { Game, GameType } from '../../domain/entities/game.entity';
import { Player } from '../../domain/entities/player.entity';
import { NotFoundException } from '@nestjs/common';

describe('GameRepository', () => {
		let repository: GameRepository;
		let mockRepository: jest.Mocked<Repository<Game>>;

		const mockPlayer: Player = {
				id: '1',
				telegramId: '123456',
				username: 'player1',
				displayName: 'Player One',
				createdAt: new Date(),
				balance: 1000,
				scores: Promise.resolve([]),
				preferences: { notifications: true, language: 'en' }
		};

		const mockGame: Game = {
				id: '1',
				type: GameType.POKER,
				isActive: true,
				createdAt: new Date(),
				players: [],
				scores: [],
				metadata: {
						initialPoints: 500,
						pointValue: 0.1,
						maxPlayers: 9
				}
		};

		beforeEach(async () => {
				mockRepository = {
						create: jest.fn(),
						save: jest.fn(),
						findOne: jest.fn(),
						find: jest.fn()
				} as any;

				const moduleFixture = await Test.createTestingModule({
						providers: [
								GameRepository,
								{
										provide: getRepositoryToken(Game),
										useValue: mockRepository
								}
						]
				}).compile();

				repository = moduleFixture.get<GameRepository>(GameRepository);
		});

	describe('create', () => {
		it('should create a new game', async () => {
			const gameData = {
				type: GameType.POKER,
				metadata: { maxPlayers: 9 },
				isActive: true
			};

			mockRepository.create.mockReturnValue(gameData as Game);
			mockRepository.save.mockResolvedValue({ ...mockGame, ...gameData });

			const result = await repository.create(GameType.POKER, { maxPlayers: 9 });
			expect(result).toEqual({ ...mockGame, ...gameData });
		});

		it('should throw error if save fails', async () => {
			mockRepository.create.mockReturnValue({} as Game);
			mockRepository.save.mockRejectedValue(new Error('Save failed'));

			await expect(repository.create(GameType.POKER, {}))
				.rejects.toThrow('Failed to save game: Save failed');
		});
	});

	describe('findById', () => {
		it('should find a game by id', async () => {
			mockRepository.findOne.mockResolvedValue(mockGame);

			const result = await repository.findById('1');
			expect(result).toEqual(mockGame);
		});

		it('should throw NotFoundException when game not found', async () => {
			mockRepository.findOne.mockResolvedValue(null);

			await expect(repository.findById('1'))
				.rejects.toThrow(NotFoundException);
		});

		it('should throw error if findById database operation fails', async () => {
			mockRepository.findOne.mockRejectedValue(new Error('Database error'));

			await expect(repository.findById('1'))
				.rejects.toThrow('Failed to find game: Database error');
		});
	});

	describe('findByIdWithPlayers', () => {
		it('should find a game with players', async () => {
			const gameWithPlayers = { ...mockGame, players: [mockPlayer] };
			mockRepository.findOne.mockResolvedValue(gameWithPlayers);

			const result = await repository.findByIdWithPlayers('1');
			expect(result).toEqual(gameWithPlayers);
		});

		it('should throw error if findByIdWithPlayers fails', async () => {
			mockRepository.findOne.mockRejectedValue(new Error('Find failed'));

			await expect(repository.findByIdWithPlayers('1'))
				.rejects.toThrow('Failed to find game with players: Find failed');
		});
	});

	describe('addPlayer', () => {
		it('should add player to game', async () => {
			const game = { ...mockGame };
			const updatedGame = { ...mockGame, players: [mockPlayer] };
			mockRepository.save.mockResolvedValue(updatedGame);

			const result = await repository.addPlayer(game, mockPlayer);
			expect(result).toEqual(updatedGame);
		});

		it('should throw error if addPlayer fails', async () => {
			const game = { ...mockGame };
			mockRepository.save.mockRejectedValue(new Error('Save failed'));

			await expect(repository.addPlayer(game, mockPlayer))
				.rejects.toThrow('Failed to add player to game: Save failed');
		});
	});

	describe('findActiveGames', () => {
		it('should return active games', async () => {
			const activeGames = [mockGame];
			mockRepository.find.mockResolvedValue(activeGames);

			const result = await repository.findActiveGames();
			expect(result).toEqual(activeGames);
		});

		it('should throw error if find fails', async () => {
			mockRepository.find.mockRejectedValue(new Error('Find failed'));

			await expect(repository.findActiveGames())
				.rejects.toThrow('Failed to find active games: Find failed');
		});
	});

	describe('update', () => {
		it('should update game successfully', async () => {
			const updatedGame = { ...mockGame, isActive: false };
			mockRepository.save.mockResolvedValue(updatedGame);

			const result = await repository.update(updatedGame);
			expect(result).toEqual(updatedGame);
		});

		it('should throw error if update fails', async () => {
			mockRepository.save.mockRejectedValue(new Error('Update failed'));

			await expect(repository.update(mockGame))
				.rejects.toThrow('Failed to update game: Update failed');
		});
	});
});

