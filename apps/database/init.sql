-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Financial Management Service Schema
CREATE TABLE IF NOT EXISTS funds (
	id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
	balance DECIMAL(10,2) DEFAULT 0.00,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	last_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	metadata JSONB
);

CREATE TYPE transaction_type AS ENUM ('deposit', 'withdraw', 'game_result', 'game_settlement', 'fund_deposit', 'fund_withdrawal');

CREATE TABLE IF NOT EXISTS transactions (
	id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
	player_id UUID NOT NULL,
	type transaction_type NOT NULL,
	amount DECIMAL(10,2) NOT NULL,
	description TEXT,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	game_id UUID,
	fund_id UUID REFERENCES funds(id),
	metadata JSONB
);

-- Game Management Service Schema
CREATE TYPE game_type AS ENUM ('poker', 'tienlen');

CREATE TABLE IF NOT EXISTS players (
	id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
	telegram_id VARCHAR(255) UNIQUE NOT NULL,
	username VARCHAR(255) NOT NULL,
	display_name VARCHAR(255),
	balance DECIMAL(10,2) DEFAULT 0.00,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	preferences JSONB
);

CREATE TABLE IF NOT EXISTS games (
	id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
	type game_type NOT NULL,
	is_active BOOLEAN DEFAULT true,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	ended_at TIMESTAMP,
	current_round_number INTEGER DEFAULT 1,
	metadata JSONB
);

CREATE TABLE IF NOT EXISTS game_players (
	game_id UUID REFERENCES games(id) ON DELETE CASCADE,
	player_id UUID REFERENCES players(id) ON DELETE CASCADE,
	PRIMARY KEY (game_id, player_id)
);

CREATE TABLE IF NOT EXISTS rounds (
	id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
	game_id UUID REFERENCES games(id) ON DELETE CASCADE,
	round_number INTEGER NOT NULL,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	metadata JSONB
);

CREATE TABLE IF NOT EXISTS game_scores (
	id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
	game_id UUID REFERENCES games(id) ON DELETE CASCADE,
	player_id UUID REFERENCES players(id) ON DELETE CASCADE,
	points INTEGER NOT NULL,
	amount DECIMAL(10,2) NOT NULL,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	metadata JSONB
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_players_telegram_id ON players(telegram_id);
CREATE INDEX IF NOT EXISTS idx_games_type ON games(type);
CREATE INDEX IF NOT EXISTS idx_transactions_player_id ON transactions(player_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_game_id ON transactions(game_id);
CREATE INDEX IF NOT EXISTS idx_game_scores_game_id ON game_scores(game_id);
CREATE INDEX IF NOT EXISTS idx_game_scores_player_id ON game_scores(player_id);
CREATE INDEX IF NOT EXISTS idx_rounds_game_id ON rounds(game_id);

-- Insert initial fund record
INSERT INTO funds (balance) VALUES (0.00) ON CONFLICT DO NOTHING;
