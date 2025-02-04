import { Player } from './player.entity';
import { GameScore } from './game-score.entity';

describe('Player', () => {
	let player: Player;

	beforeEach(() => {
		player = new Player();
		player.id = '1';
		player.telegramId = '123456';
		player.username = 'testuser';
		player.displayName = 'Test User';
		player.createdAt = new Date();
		player.balance = 1000;
		player.scores = Promise.resolve([]);
		player.preferences = {
			notifications: true,
			language: 'en'
		};
	});

	it('should create a player instance', () => {
		expect(player).toBeDefined();
		expect(player.id).toBe('1');
		expect(player.telegramId).toBe('123456');
		expect(player.username).toBe('testuser');
		expect(player.displayName).toBe('Test User');
		expect(player.createdAt).toBeDefined();
		expect(player.balance).toBe(1000);
		expect(player.preferences).toBeDefined();
	});

	it('should handle scores correctly', async () => {
		const score = new GameScore();
		score.id = '1';
		player.scores = Promise.resolve([score]);
		
		const scores = await player.scores;
		expect(scores).toHaveLength(1);
		expect(scores[0]).toBe(score);
	});

	it('should handle preferences correctly', () => {
		expect(player.preferences.notifications).toBe(true);
		expect(player.preferences.language).toBe('en');
	});

	it('should handle optional preferences', () => {
		player.preferences = {};
		expect(player.preferences.notifications).toBeUndefined();
		expect(player.preferences.language).toBeUndefined();
	});

	it('should handle null preferences', () => {
		player.preferences = undefined;
		expect(player.preferences).toBeUndefined();
	});

	it('should handle optional display name', () => {
		player.displayName = undefined;
		expect(player.displayName).toBeUndefined();
	});

	it('should handle balance updates', () => {
		player.balance = 2000;
		expect(player.balance).toBe(2000);
	});
});