
CREATE TABLE t_p15533629_people_ranking_app.politician_votes (
  id SERIAL PRIMARY KEY,
  politician_id INTEGER NOT NULL,
  voter_ip VARCHAR(64) NOT NULL,
  vote_type VARCHAR(4) NOT NULL CHECK (vote_type IN ('up', 'down')),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(politician_id, voter_ip)
);
