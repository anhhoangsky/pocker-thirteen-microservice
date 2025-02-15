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

CREATE TYPE transaction_type AS ENUM ('deposit', 'withdraw', 'game_result');

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
CREATE TYPE game_status AS ENUM ('active', 'completed', 'cancelled');

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
	status game_status DEFAULT 'active',
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	ended_at TIMESTAMP,
	metadata JSONB
);

CREATE TABLE IF NOT EXISTS game_players (
	game_id UUID REFERENCES games(id) ON DELETE CASCADE,
	player_id UUID REFERENCES players(id) ON DELETE CASCADE,
	PRIMARY KEY (game_id, player_id)
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
CREATE INDEX IF NOT EXISTS idx_games_status ON games(status);
CREATE INDEX IF NOT EXISTS idx_transactions_player_id ON transactions(player_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_game_id ON transactions(game_id);
CREATE INDEX IF NOT EXISTS idx_game_scores_game_id ON game_scores(game_id);
CREATE INDEX IF NOT EXISTS idx_game_scores_player_id ON game_scores(player_id);

-- Insert initial fund record
INSERT INTO funds (balance) VALUES (0.00) ON CONFLICT DO NOTHING;
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