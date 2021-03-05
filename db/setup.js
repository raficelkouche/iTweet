const pg = require("pg");

const client = new pg.Client();

client
  .connect()
  .catch(error => console.log("error: ", error));

module.exports = client;