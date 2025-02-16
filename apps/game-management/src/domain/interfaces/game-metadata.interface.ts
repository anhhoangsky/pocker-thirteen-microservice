interface PlayerResult {
	playerId: string;
	playerName: string;
	points: number;
}

export interface GameMetadata {
	initialPoints: number;
	pointValue: number;
	maxPlayers?: number;
	winners?: PlayerResult[];
	losers?: PlayerResult[];
}