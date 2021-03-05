const { Pool } = require("pg");

const pool = new Pool();


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
    .catch(error => console.log(error.stack))
};
exports.addNewUser = addNewUser;

const retrieveUserRecord = username => {
  return pool.query(`SELECT * FROM users WHERE username = $1`, [username])
      .then(res => res.rows[0])
      .catch(error => console.log(error.stack))
}
exports.retrieveUserRecord = retrieveUserRecord;