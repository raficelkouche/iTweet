DROP TABLE IF EXISTS retweets CASCADE;

CREATE TABLE retweets (
  id SERIAL PRIMARY KEY NOT NULL,
  tweet_id INTEGER REFERENCES tweets(id) ON DELETE CASCADE,
  retweeted_by INTEGER REFERENCES users(id) ON DELETE CASCADE
);
