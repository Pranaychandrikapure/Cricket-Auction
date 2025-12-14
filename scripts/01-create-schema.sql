-- Teams table
CREATE TABLE IF NOT EXISTS teams (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  short_name VARCHAR(10) NOT NULL UNIQUE,
  logo_url TEXT,
  total_budget DECIMAL(10, 2) NOT NULL DEFAULT 100.00,
  remaining_budget DECIMAL(10, 2) NOT NULL DEFAULT 100.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Players table
CREATE TABLE IF NOT EXISTS players (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  role VARCHAR(50) NOT NULL,
  base_price DECIMAL(10, 2) NOT NULL,
  photo_url TEXT,
  batting_style VARCHAR(50),
  bowling_style VARCHAR(50),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Auction state table
CREATE TABLE IF NOT EXISTS auction_state (
  id SERIAL PRIMARY KEY,
  current_player_id INTEGER REFERENCES players(id),
  current_bid DECIMAL(10, 2),
  current_team_id INTEGER REFERENCES teams(id),
  state VARCHAR(50) NOT NULL DEFAULT 'idle', -- idle, active, paused, countdown, sold
  countdown_seconds INTEGER DEFAULT 10,
  is_magic_card BOOLEAN DEFAULT FALSE,
  magic_card_type VARCHAR(50), -- double_or_nothing, steal_bid, extra_time
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default auction state
INSERT INTO auction_state (state, countdown_seconds) 
VALUES ('idle', 10) 
ON CONFLICT DO NOTHING;

-- Sold players table
CREATE TABLE IF NOT EXISTS sold_players (
  id SERIAL PRIMARY KEY,
  player_id INTEGER REFERENCES players(id),
  team_id INTEGER REFERENCES teams(id),
  final_price DECIMAL(10, 2) NOT NULL,
  sold_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bid history table
CREATE TABLE IF NOT EXISTS bid_history (
  id SERIAL PRIMARY KEY,
  player_id INTEGER REFERENCES players(id),
  team_id INTEGER REFERENCES teams(id),
  bid_amount DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Magic cards table
CREATE TABLE IF NOT EXISTS magic_cards (
  id SERIAL PRIMARY KEY,
  team_id INTEGER REFERENCES teams(id),
  card_type VARCHAR(50) NOT NULL, -- double_or_nothing, steal_bid, extra_time
  is_used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_sold_players_team ON sold_players(team_id);
CREATE INDEX IF NOT EXISTS idx_bid_history_player ON bid_history(player_id);
CREATE INDEX IF NOT EXISTS idx_magic_cards_team ON magic_cards(team_id);
