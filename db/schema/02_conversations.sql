DROP TABLE IF EXISTS conversations CASCADE;
CREATE TABLE conversations
(
  id SERIAL PRIMARY KEY NOT NULL,
  user1_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  user2_id INTEGER REFERENCES users(id) ON DELETE CASCADE
  CHECK (user1_id <> user2_id) /*ensure they are not the same person*/
);