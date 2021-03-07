const { Pool } = require("pg");
const format = require("pg-format");

const pool = new Pool();

/*
helpers for users
*/
const getAllUsers = () => {
  return pool
    .query('SELECT * FROM users')
    .then(res => res.rows[0])
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


const closeConnection = async () => {
  await pool.end()
}
exports.closeConnection = closeConnection;

/*
helpers for tweets
*/
const getAllTweets = () => {
  return pool.query(`SELECT * FROM tweets;`)
    .then(res => res.rows)
    .catch(error => console.log("query error: ", error.detail))
}
exports.getAllTweets = getAllTweets;

const getTweetsByUser = user_id => {
  return pool.query(`SELECT * FROM tweets WHERE user_id=$1`, [user_id])
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