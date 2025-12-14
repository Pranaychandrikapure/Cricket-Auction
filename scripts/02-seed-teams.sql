-- Insert teams
INSERT INTO teams (name, short_name, total_budget, remaining_budget, logo_url) VALUES
('Mumbai Strikers', 'MUM', 100.00, 100.00, '/placeholder.svg?height=80&width=80'),
('Delhi Warriors', 'DEL', 100.00, 100.00, '/placeholder.svg?height=80&width=80'),
('Chennai Champions', 'CHE', 100.00, 100.00, '/placeholder.svg?height=80&width=80'),
('Bangalore Blazers', 'BLR', 100.00, 100.00, '/placeholder.svg?height=80&width=80'),
('Kolkata Knights', 'KOL', 100.00, 100.00, '/placeholder.svg?height=80&width=80'),
('Hyderabad Heroes', 'HYD', 100.00, 100.00, '/placeholder.svg?height=80&width=80'),
('Punjab Panthers', 'PUN', 100.00, 100.00, '/placeholder.svg?height=80&width=80'),
('Rajasthan Royals', 'RAJ', 100.00, 100.00, '/placeholder.svg?height=80&width=80')
ON CONFLICT (name) DO NOTHING;

-- Give each team one of each type of magic card
INSERT INTO magic_cards (team_id, card_type)
SELECT id, 'double_or_nothing' FROM teams
ON CONFLICT DO NOTHING;

INSERT INTO magic_cards (team_id, card_type)
SELECT id, 'steal_bid' FROM teams
ON CONFLICT DO NOTHING;

INSERT INTO magic_cards (team_id, card_type)
SELECT id, 'extra_time' FROM teams
ON CONFLICT DO NOTHING;
