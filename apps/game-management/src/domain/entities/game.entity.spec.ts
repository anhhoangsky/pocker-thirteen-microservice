import { Game, GameType } from './game.entity';
import { Player } from './player.entity';
import { GameScore } from './game-score.entity';

describe('Game', () => {
	let game: Game;

	beforeEach(() => {
		game = new Game();
		game.id = '1';
		game.type = GameType.POKER;
		game.isActive = true;
		game.createdAt = new Date();
		game.players = [];
		game.scores = [];
		game.metadata = {
			initialPoints: 1000,
			pointValue: 0.1,
			maxPlayers: 9
		};
	});

	it('should create a game instance', () => {
		expect(game).toBeDefined();
		expect(game.id).toBe('1');
		expect(game.type).toBe(GameType.POKER);
		expect(game.isActive).toBe(true);
		expect(game.createdAt).toBeDefined();
		expect(game.players).toEqual([]);
		expect(game.scores).toEqual([]);
		expect(game.metadata).toBeDefined();
	});

	it('should handle game type correctly', () => {
		game.type = GameType.TIENLEN;
		expect(game.type).toBe(GameType.TIENLEN);
	});

	it('should handle players array', () => {
		const player = new Player();
		player.id = '1';
		game.players.push(player);
		expect(game.players.length).toBe(1);
		expect(game.players[0]).toBe(player);
	});

	it('should handle scores array', () => {
		const score = new GameScore();
		score.id = '1';
		game.scores.push(score);
		expect(game.scores.length).toBe(1);
		expect(game.scores[0]).toBe(score);
	});

	it('should handle metadata correctly', () => {
		expect(game.metadata.initialPoints).toBe(1000);
		expect(game.metadata.pointValue).toBe(0.1);
		expect(game.metadata.maxPlayers).toBe(9);
	});

	it('should handle optional metadata', () => {
		game.metadata = {};
		expect(game.metadata.initialPoints).toBeUndefined();
		expect(game.metadata.pointValue).toBeUndefined();
		expect(game.metadata.maxPlayers).toBeUndefined();
	});

	it('should handle null metadata', () => {
		game.metadata = undefined;
		expect(game.metadata).toBeUndefined();
	});

	it('should handle game end', () => {
		const endDate = new Date();
		game.endedAt = endDate;
		game.isActive = false;
		expect(game.endedAt).toBe(endDate);
		expect(game.isActive).toBe(false);
	});
});