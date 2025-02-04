import { GameScore } from './game-score.entity';
import { Game } from './game.entity';
import { Player } from './player.entity';

describe('GameScore', () => {
	let gameScore: GameScore;

	beforeEach(() => {
		gameScore = new GameScore();
		gameScore.id = '1';
		gameScore.points = 100;
		gameScore.amount = 10;
		gameScore.createdAt = new Date();
		gameScore.game = new Game();
		gameScore.player = new Player();
		gameScore.metadata = {
			rank: 1,
			isReload: false,
			notes: 'Test note'
		};
	});

	it('should create a game score instance', () => {
		expect(gameScore).toBeDefined();
		expect(gameScore.id).toBe('1');
		expect(gameScore.points).toBe(100);
		expect(gameScore.amount).toBe(10);
		expect(gameScore.createdAt).toBeDefined();
		expect(gameScore.game).toBeDefined();
		expect(gameScore.player).toBeDefined();
		expect(gameScore.metadata).toBeDefined();
	});

	it('should handle metadata correctly', () => {
		expect(gameScore.metadata.rank).toBe(1);
		expect(gameScore.metadata.isReload).toBe(false);
		expect(gameScore.metadata.notes).toBe('Test note');
	});

	it('should handle optional metadata', () => {
		gameScore.metadata = {};
		expect(gameScore.metadata.rank).toBeUndefined();
		expect(gameScore.metadata.isReload).toBeUndefined();
		expect(gameScore.metadata.notes).toBeUndefined();
	});

	it('should handle null metadata', () => {
		gameScore.metadata = undefined;
		expect(gameScore.metadata).toBeUndefined();
	});
});