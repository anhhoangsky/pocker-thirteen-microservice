import { Test, TestingModule } from '@nestjs/testing';
import { GameController } from './game.controller';
import { GameService } from '../../application/services/game.service';
import { GameType } from '../../domain/entities/game.entity';
import { GameScore } from '../../domain/entities/game-score.entity';

describe('GameController', () => {
  let controller: GameController;
  let gameService: jest.Mocked<GameService>;

  beforeEach(async () => {
    const mockGameService = {
      createGame: jest.fn(),
      addPlayerToGame: jest.fn(),
      recordScore: jest.fn(),
      endGame: jest.fn()
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [GameController],
      providers: [
        {
          provide: GameService,
          useValue: mockGameService
        }
      ]
    }).compile();

    controller = module.get<GameController>(GameController);
    gameService = module.get(GameService);
  });

  describe('createGame', () => {
    it('should create a new POKER game', async () => {
      const mockGame = { 
        id: '123', 
        type: GameType.POKER,
        isActive: true,
        createdAt: new Date(),
        players: [],
        scores: [],
        metadata: {
          initialPoints: 500,
          pointValue: 0.1
        }
      };
      gameService.createGame.mockResolvedValue(mockGame);

      const result = await controller.createGame({ 
        type: 'poker',
        metadata: { maxPlayers: 9 }
      });
      
      expect(result).toEqual(mockGame);
    });

    it('should create a TIENLEN game', async () => {
      const mockGame = { 
        id: '123', 
        type: GameType.TIENLEN,
        isActive: true,
        createdAt: new Date(),
        players: [],
        scores: [],
        metadata: {
          initialPoints: 0,
          pointValue: 1,
          maxPlayers: 4
        }
      };
      gameService.createGame.mockResolvedValue(mockGame);

      const result = await controller.createGame({
        type: 'tienlen',
        metadata: { maxPlayers: 4 }
      });
      
      expect(result).toEqual(mockGame);
    });
  });

  describe('joinGame', () => {
    it('should add player to game', async () => {
      const mockPlayer = {
        id: 'player-123',
        telegramId: '12345',
        username: 'testuser',
        createdAt: new Date(),
        balance: 0,
        scores: Promise.resolve([])
      };
      
      const mockGame = { 
        id: '123',
        type: GameType.POKER,
        isActive: true,
        createdAt: new Date(),
        players: [mockPlayer],
        scores: []
      };
      
      gameService.addPlayerToGame.mockResolvedValue(mockGame);

      const data = { gameId: '123', playerId: 'player-123' };
      const result = await controller.joinGame(data);
      
      expect(result).toEqual(mockGame);
      expect(gameService.addPlayerToGame).toHaveBeenCalledWith(
        data.gameId,
        data.playerId
      );
    });
  });

  describe('recordScore', () => {
    it('should record score with rank', async () => {
      const mockGame = {
        id: '123',
        type: GameType.POKER,
        isActive: true,
        createdAt: new Date(),
        players: [],
        scores: [],
        metadata: {
          initialPoints: 500,
          pointValue: 0.1
        }
      };

      const mockPlayer = {
        id: 'player-123',
        telegramId: '12345',
        username: 'testuser',
        createdAt: new Date(),
        balance: 0,
        scores: Promise.resolve([])
      };

      const mockScore = new GameScore();
      mockScore.id = '123';
      mockScore.game = mockGame;
      mockScore.player = mockPlayer;
      mockScore.points = 100;
      mockScore.amount = 10;
      mockScore.createdAt = new Date();
      mockScore.metadata = { rank: 1 };
      
      gameService.recordScore.mockResolvedValue(mockScore);

      const data = {
        gameId: '123',
        playerId: 'player-123',
        points: 100,
        rank: 1
      };
      const result = await controller.recordScore(data);
      
      expect(result).toEqual(mockScore);
      expect(gameService.recordScore).toHaveBeenCalledWith(
        data.gameId,
        data.playerId,
        data.points,
        data.rank
      );
    });

    it('should record score without rank', async () => {
      const mockGame = {
        id: '123',
        type: GameType.POKER,
        isActive: true,
        createdAt: new Date(),
        players: [],
        scores: [],
        metadata: {
          initialPoints: 500,
          pointValue: 0.1
        }
      };

      const mockPlayer = {
        id: 'player-123',
        telegramId: '12345',
        username: 'testuser',
        createdAt: new Date(),
        balance: 0,
        scores: Promise.resolve([])
      };

      const mockScore = new GameScore();
      mockScore.id = '123';
      mockScore.game = mockGame;
      mockScore.player = mockPlayer;
      mockScore.points = 100;
      mockScore.amount = 10;
      mockScore.createdAt = new Date();
      
      gameService.recordScore.mockResolvedValue(mockScore);

      const data = {
        gameId: '123',
        playerId: 'player-123',
        points: 100
      };
      const result = await controller.recordScore(data);
      
      expect(result).toEqual(mockScore);
      expect(gameService.recordScore).toHaveBeenCalledWith(
        data.gameId,
        data.playerId,
        data.points,
        undefined
      );
    });
  });

  describe('endGame', () => {
    it('should end game', async () => {
      const mockGame = { 
        id: '123',
        type: GameType.POKER,
        isActive: false,
        createdAt: new Date(),
        endedAt: new Date(),
        players: [],
        scores: []
      };
      
      gameService.endGame.mockResolvedValue(mockGame);

      const data = { gameId: '123' };
      const result = await controller.endGame(data);
      
      expect(result).toEqual(mockGame);
      expect(gameService.endGame).toHaveBeenCalledWith(data.gameId);
    });
  });
});

