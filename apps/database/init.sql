-- Financial Management Service Schema
CREATE TABLE fund (
	id UUID PRIMARY KEY,
	name VARCHAR(255) NOT NULL,
	balance DECIMAL(10,2) DEFAULT 0,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	last_updated_at TIMESTAMP,
	metadata JSONB
);

CREATE TYPE transaction_type AS ENUM ('game_settlement', 'fund_deposit', 'fund_withdrawal');

CREATE TABLE transaction (
	id UUID PRIMARY KEY,
	player_id UUID NOT NULL,
	type transaction_type NOT NULL,
	amount DECIMAL(10,2) NOT NULL,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	game_id UUID,
	fund_id UUID REFERENCES fund(id),
	metadata JSONB
);

-- Game Management Service Schema
CREATE TYPE game_type AS ENUM ('poker', 'tienlen');

CREATE TABLE player (
	id UUID PRIMARY KEY,
	telegram_id VARCHAR(255) NOT NULL,
	username VARCHAR(255) NOT NULL,
	display_name VARCHAR(255),
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	balance DECIMAL(10,2) DEFAULT 0,
	preferences JSONB
);

CREATE TABLE game (
	id UUID PRIMARY KEY,
	type game_type NOT NULL,
	is_active BOOLEAN DEFAULT true,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	ended_at TIMESTAMP,
	metadata JSONB
);

CREATE TABLE game_player (
	game_id UUID REFERENCES game(id) ON DELETE CASCADE,
	player_id UUID REFERENCES player(id) ON DELETE CASCADE,
	PRIMARY KEY (game_id, player_id)
);

CREATE TABLE game_score (
	id UUID PRIMARY KEY,
	game_id UUID REFERENCES game(id) ON DELETE CASCADE,
	player_id UUID REFERENCES player(id) ON DELETE CASCADE,
	points DECIMAL(10,2) NOT NULL,
	amount DECIMAL(10,2) NOT NULL,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	metadata JSONB
);

-- Indexes
CREATE INDEX idx_transaction_player_id ON transaction(player_id);
CREATE INDEX idx_transaction_game_id ON transaction(game_id);
CREATE INDEX idx_game_score_game_id ON game_score(game_id);
CREATE INDEX idx_game_score_player_id ON game_score(player_id);