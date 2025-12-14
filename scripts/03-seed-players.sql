-- Insert sample players
INSERT INTO players (name, role, base_price, batting_style, bowling_style, description, photo_url) VALUES
('Virat Sharma', 'Batsman', 10.00, 'Right-hand bat', 'N/A', 'Aggressive top-order batsman with excellent technique', '/placeholder.svg?height=200&width=200'),
('Rohit Patel', 'Batsman', 12.00, 'Right-hand bat', 'N/A', 'Opening batsman known for big hitting', '/placeholder.svg?height=200&width=200'),
('MS Kumar', 'Wicketkeeper', 15.00, 'Right-hand bat', 'N/A', 'Experienced wicketkeeper-batsman and captain', '/placeholder.svg?height=200&width=200'),
('Jasprit Singh', 'Bowler', 11.00, 'Right-hand bat', 'Fast', 'Deadly fast bowler with yorker specialty', '/placeholder.svg?height=200&width=200'),
('Ravindra Jadeja', 'All-rounder', 13.00, 'Left-hand bat', 'Slow left-arm orthodox', 'Complete all-rounder, excellent fielder', '/placeholder.svg?height=200&width=200'),
('Hardik Pandya', 'All-rounder', 14.00, 'Right-hand bat', 'Fast-medium', 'Dynamic all-rounder with power hitting', '/placeholder.svg?height=200&width=200'),
('Rashid Khan', 'Bowler', 10.00, 'Right-hand bat', 'Leg break googly', 'World-class leg spinner', '/placeholder.svg?height=200&width=200'),
('David Warner', 'Batsman', 11.00, 'Left-hand bat', 'Leg break', 'Explosive opening batsman', '/placeholder.svg?height=200&width=200'),
('Ben Stokes', 'All-rounder', 16.00, 'Left-hand bat', 'Fast-medium', 'Premium all-rounder, match winner', '/placeholder.svg?height=200&width=200'),
('Pat Cummins', 'Bowler', 12.00, 'Right-hand bat', 'Fast', 'Leading fast bowler, excellent captain', '/placeholder.svg?height=200&width=200'),
('KL Rahul', 'Wicketkeeper', 13.00, 'Right-hand bat', 'N/A', 'Stylish wicketkeeper-batsman', '/placeholder.svg?height=200&width=200'),
('Shikhar Dhawan', 'Batsman', 9.00, 'Left-hand bat', 'Right-arm off break', 'Experienced opener, tournament specialist', '/placeholder.svg?height=200&width=200'),
('Mohammed Shami', 'Bowler', 10.00, 'Right-hand bat', 'Fast', 'Skilled fast bowler with reverse swing', '/placeholder.svg?height=200&width=200'),
('Suryakumar Yadav', 'Batsman', 11.00, 'Right-hand bat', 'Right-arm off break', '360-degree batsman, innovative stroke-maker', '/placeholder.svg?height=200&width=200'),
('Yuzvendra Chahal', 'Bowler', 9.00, 'Right-hand bat', 'Leg break', 'Wicket-taking leg spinner', '/placeholder.svg?height=200&width=200'),
('Kane Williamson', 'Batsman', 12.00, 'Right-hand bat', 'Right-arm off break', 'Classical batsman, calm under pressure', '/placeholder.svg?height=200&width=200'),
('Trent Boult', 'Bowler', 11.00, 'Left-hand bat', 'Fast', 'Left-arm swing bowler, new ball expert', '/placeholder.svg?height=200&width=200'),
('Andre Russell', 'All-rounder', 15.00, 'Right-hand bat', 'Fast', 'Power hitter and impact player', '/placeholder.svg?height=200&width=200'),
('Quinton de Kock', 'Wicketkeeper', 12.00, 'Left-hand bat', 'N/A', 'Attacking wicketkeeper-batsman', '/placeholder.svg?height=200&width=200'),
('Jos Buttler', 'Wicketkeeper', 14.00, 'Right-hand bat', 'Right-arm off break', 'Dynamic keeper, aggressive batsman', '/placeholder.svg?height=200&width=200')
ON CONFLICT DO NOTHING;
