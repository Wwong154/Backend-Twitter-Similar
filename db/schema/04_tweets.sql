DROP TABLE IF EXISTS tweets CASCADE;
CREATE TABLE tweets
(
  id SERIAL PRIMARY KEY NOT NULL,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  content VARCHAR(255) NOT NULL,
  edit BOOLEAN DEFAULT FALSE,
  last_update_date DATE,
  tweet_date DATE NOT NULL
);
