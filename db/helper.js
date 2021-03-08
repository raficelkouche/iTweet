const { Pool } = require("pg");
const format = require("pg-format");

const pool = new Pool();

/*
helpers for users
*/
const getAllUsers = () => {
  return pool
    .query('SELECT * FROM users')
    .then(res => res.rows)
    .catch(err => console.log(err))
}
exports.getAllUsers = getAllUsers;

const addNewUser = (userInfo) => {
  const {username, password} = userInfo
  //using a parameterized query to avoid sql injection
  return pool.query(`
    INSERT INTO users (username, password)
    VALUES($1, $2)
    RETURNING *;
  `, [username, password])
    .then(res => res.rows[0])
    .catch(error => console.log(error.detail))
};
exports.addNewUser = addNewUser;

const retrieveUserRecord = username => {
  return pool.query(`SELECT * FROM users WHERE username = $1`, [username])
      .then(res => res.rows[0])
      .catch(error => console.log(error.detail))
}
exports.retrieveUserRecord = retrieveUserRecord;

/*
helpers for chatting
*/
const getUserMessages = user_id => {
  return pool.query(`
    SELECT string_id, content, sender_id, receiver_id, is_read, created_on 
    FROM messages
    JOIN users ON (sender_id = users.id OR receiver_id = users.id)
    WHERE users.id = $1;
    `, [user_id])
    .then(res => res.rows)
    .catch(err => console.log("query error: ", err.detail))
}
exports.getUserMessages = getUserMessages;

//to be used for testing purposes only
const getSpecificMessage = (content, sender_id, receiver_id) => {
  return pool.query(`
    SELECT *
    FROM messages
    WHERE content=$1 AND sender_id=$2 AND receiver_id=$3;
    `, [content, sender_id, receiver_id])
    .then(res => res.rows[0])
    .catch(err => console.log("query error: ", err.detail))
}
exports.getSpecificMessage = getSpecificMessage

const updateMessages = conversation => {
  const values = [];
  
  for (const key in conversation) {
    values.push(Object.values(conversation[key]))
  }
  
  const queryString = format('INSERT INTO messages (string_id, content, sender_id, receiver_id, is_read, created_on) VALUES %L', values)

  pool.query(queryString, [])
    .catch(err => console.log(err))
}
exports.updateMessages = updateMessages;

const updateMessageStatus = string_id => {
  pool.query(`
  UPDATE messages
  SET is_read = true
  WHERE string_id = $1;
  `, [string_id])
}
exports.updateMessageStatus = updateMessageStatus;

/*
helpers for tweets
*/
const getAllTweets = () => {
  return pool.query(`SELECT * FROM tweets ORDER BY created_on DESC;`)
    .then(res => res.rows)
    .catch(error => console.log("query error: ", error.detail))
}
exports.getAllTweets = getAllTweets;

//this will get the tweets tweeted by a specific user (retweets are put in a separate function below)
const getTweetsByUser = user_id => {
  return pool.query(`
  SELECT * 
  FROM tweets 
  WHERE user_id=$1
  ORDER BY created_on DESC;
  `, [user_id])
    .then(res => res.rows)
    .catch(error => console.log("query error: ", error.detail))
}
exports.getTweetsByUser = getTweetsByUser;

const getTweetByID = (user_id, tweet_id) => {
  return pool.query(`SELECT * FROM tweets WHERE id=$1 AND user_id=$2 `, [tweet_id, user_id])
    .then(res => res.rows[0])
    .catch(error => console.log("query error: ", error.detail))
}
exports.getTweetByID = getTweetByID;

const addTweet = (tweet, user_id) => {
  return pool.query(`
    INSERT into tweets (text, user_id) VALUES ($1, $2) RETURNING *; 
  `, [tweet, user_id])
    .then(res => res.rows[0])
    .catch(error => console.log("query error: ", error.detail))
}
exports.addTweet = addTweet;

const editTweet = (user_id, tweet_id, newTweet) => {
  return pool.query(`
    UPDATE tweets 
    SET text=$1
    WHERE id=$2 AND user_id=$3
    RETURNING *;
    `, [newTweet, tweet_id, user_id])
    .then(res => res.rows[0])
    .catch(error => console.log("query error: ", error.detail))
}
exports.editTweet = editTweet;

const deleteTweet = (user_id, tweet_id) => {
  return pool.query(`
    DELETE FROM tweets
    WHERE id=$1 AND user_id=$2
    RETURNING *;
  `, [tweet_id, user_id])
    .then(res => res.rows[0])
    .catch(error => console.log("query error: ", error.detail))
}
exports.deleteTweet = deleteTweet;

const likeTweet = tweet_id => {
  return pool.query(`
    UPDATE tweets
    SET likes = likes + 1
    WHERE id=$1
    RETURNING *;
    `,[tweet_id])
    .then(res => res.rows[0])
    .catch(error => console.log("query error: ", error.detail))
}
exports.likeTweet = likeTweet;

const unlikeTweet = tweet_id => {
  return pool.query(`
    UPDATE tweets
    SET likes = likes - 1
    WHERE id=$1 AND likes > 0
    RETURNING *;
    `, [tweet_id])
    .then(res => res.rows[0])
    .catch(error => console.log("query error: ", error.detail))
}
exports.unlikeTweet = unlikeTweet;

//this will get all the retweeted tweets by a given user
const getRetweetedTweets = user_id => {
  return pool.query(`
    SELECT tweets.* 
    FROM tweets
    JOIN retweets ON retweets.tweet_id = tweets.id
    WHERE retweeted_by = $1
    ORDER BY created_on DESC;
    `, [user_id])
    .then(res => res.rows)
    .catch(error => console.log("query error: ", error.detail))
}
exports.getRetweetedTweets = getRetweetedTweets;

const getRetweetCount = tweet_id => {
  return pool.query(`
    SELECT tweet_id, COUNT(*) as retweet_count
    FROM retweets
    WHERE tweet_id=$1 
    GROUP BY tweet_id;
  `, [tweet_id])
  .then(res => res.rows[0])
  .catch(error => console.log("query error: ", error.detail))
}
exports.getRetweetCount = getRetweetCount;

const addToRetweets = (tweet_id, user_id) => {
  return pool.query(`
    INSERT INTO retweets (tweet_id, retweeted_by)
    VALUES ($1, $2)
    RETURNING *;
  `, [tweet_id, user_id])
  .then(res => res.rows[0])
  .catch(error => console.log("query error: ", error.detail))
}
exports.addToRetweets = addToRetweets;

const increaseRetweetCount = tweet_id => {
  return pool.query(`
    UPDATE tweets
    SET retweets=retweets + 1
    WHERE id=$1
    RETURNING *;
  `, [tweet_id])
}
exports.increaseRetweetCount = increaseRetweetCount;

const getTweetThread = tweet_id => {
  return pool.query(`
    SELECT *
    FROM threads
    WHERE parent_tweet=$1
    ORDER BY created_on ASC;
  `, [tweet_id])
  .then(res => res.rows)
  .catch(error => console.log("query error: ", error.detail))
}
exports.getTweetThread = getTweetThread;

const getUserReplies = user_id => {
  return pool.query(`
    SELECT *
    FROM threads
    WHERE reply_author=$1
    ORDER BY created_on DESC;
  `, [user_id])
  .then(res => res.rows)
  .catch(error => console.log("query error: ", error.detail))
}
exports.getUserReplies = getUserReplies;

const addReply = (user_id, parent_tweet, reply) => {
  return pool.query(`
    INSERT INTO threads (parent_tweet, reply_author, reply)
    VALUES ($1,$2,$3)
    RETURNING *;
  `, [parent_tweet, user_id, reply])
  .then(res => res.rows[0])
  .catch(error => console.log("query error: ", error.detail))
}
exports.addReply = addReply;


const closeConnection = async () => {
  await pool.end()
}
exports.closeConnection = closeConnection;