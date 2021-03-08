/*USERS*/
INSERT INTO users (username, password) VALUES ('Rafic', '$2b$10$TxdnHU2hjro8Xo9wLjDvruEDjkhLcUsjpJ7MB8W9zmwkx8t0M03ki');
INSERT INTO users (username, password) VALUES ('John', '$2b$10$TxdnHU2hjro8Xo9wLjDvruEDjkhLcUsjpJ7MB8W9zmwkx8t0M03ki');
INSERT INTO users (username, password) VALUES ('Adam', '$2b$10$TxdnHU2hjro8Xo9wLjDvruEDjkhLcUsjpJ7MB8W9zmwkx8t0M03ki');

/*TWEETS*/
INSERT INTO tweets (text, user_id, likes, retweets) VALUES ('I have just joined iTweet!', 1, 1, 2);
INSERT INTO tweets (text, user_id, retweets) VALUES ('Anyone up for lunch?', 1, 0);
INSERT INTO tweets (text, user_id, retweets) VALUES ('I have my first interview today, wish me luck guys...', 2, 1);
INSERT INTO tweets (text, user_id, retweets) VALUES ('There will be a talk by a software engineer from Amazon at 3:00PM EST make sure you check it out!', 3, 3);

/*MESSAGES*/
INSERT INTO messages (string_id, content, sender_id, receiver_id) VALUES ('c73beace-902f-47bd-a03b-ed26efc741df', 'Hey! how are you?', 1, 2);
INSERT INTO messages (string_id, content, sender_id, receiver_id) VALUES ('1b610a1a-a4f5-43e7-8dbc-b095539c5974','I am doing great!', 2, 1);

/*RETWEETS*/
INSERT INTO retweets (tweet_id, retweeted_by) VALUES (1,2);
INSERT INTO retweets (tweet_id, retweeted_by) VALUES (4,2);
INSERT INTO retweets (tweet_id, retweeted_by) VALUES (3,2);
INSERT INTO retweets (tweet_id, retweeted_by) VALUES (1,3);
INSERT INTO retweets (tweet_id, retweeted_by) VALUES (4,3);
INSERT INTO retweets (tweet_id, retweeted_by) VALUES (4,1);

/*THREADS*/
INSERT INTO threads (parent_tweet, reply_author, reply) VALUES (2, 3, 'Yes I am! lets meet up at Swiss Chalet');
INSERT INTO threads (parent_tweet, reply_author, reply) VALUES (2, 1, 'can I join you guys too?');
INSERT INTO threads (parent_tweet, reply_author, reply) VALUES (4, 2, 'I can''t wait to hear what he has to say !');