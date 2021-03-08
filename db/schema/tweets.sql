DROP TABLE IF EXISTS tweets CASCADE;

CREATE TABLE tweets (
  id SERIAL PRIMARY KEY NOT NULL, 
  text VARCHAR(255) NOT NULL,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  likes INTEGER DEFAULT 0,
  retweets INTEGER DEFAULT 0, /*this can be replaced by an aggregate function that utilizes the retweets table*/
  created_on TIMESTAMP DEFAULT NOW()
);