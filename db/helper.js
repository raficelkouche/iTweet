const { Pool } = require("pg");

const pool = new Pool();


const getAllUsers = () => {
  return pool
          .query('SELECT * FROM users')
          .then(res => res.rows[0])
          .catch(err => console.log(err))
}
exports.getAllUsers = getAllUsers;