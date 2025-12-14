-- Add users table for authentication
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'team_owner')),
  team_id INTEGER REFERENCES teams(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add email column to players table
ALTER TABLE players ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- Add tick_size to auction_state
ALTER TABLE auction_state ADD COLUMN IF NOT EXISTS tick_size NUMERIC DEFAULT 10;

-- Create admin user (password: admin123)
INSERT INTO users (email, password_hash, role) 
VALUES ('admin@auction.com', '$2a$10$rQZ4jHxGKvKz3h8mN6qNWeQYKjN3YvXJ7HqYxVZxGKzQvPKQGqzC2', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Create team owner accounts (password: owner123)
INSERT INTO users (email, password_hash, role, team_id)
SELECT 
  LOWER(REPLACE(name, ' ', '')) || '@auction.com',
  '$2a$10$rQZ4jHxGKvKz3h8mN6qNWeQYKjN3YvXJ7HqYxVZxGKzQvPKQGqzC2',
  'team_owner',
  id
FROM teams
ON CONFLICT (email) DO NOTHING;
