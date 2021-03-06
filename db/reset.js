/*will be used to reset the database whenever required */
// load .env data into process.env
require('dotenv').config();
const ENV = "test"; //this is currently hardcoded as development/production setup is not implemented
// other dependencies
const fs = require('fs');
const chalk = require('chalk');
const Client = require('pg-native');

// PG connection setup
const client = new Client();

// Loads the schema files from db/schema
const runSchemaFiles = function() {
  console.log(chalk.cyan(`-> Loading Schema Files ...`));
  const schemaFilenames = fs.readdirSync('./db/schema');

  for (const fn of schemaFilenames) {
    const sql = fs.readFileSync(`./db/schema/${fn}`, 'utf8');
    console.log(`\t-> Running ${chalk.green(fn)}`);
    client.querySync(sql);
  }
};

const runSeedFiles = function() {
  console.log(chalk.cyan(`-> Loading Seeds ...`));
  const sql = fs.readFileSync(`./db/seeds/${ENV}.sql`);
  console.log(`\t-> Running ${chalk.green(`${ENV}.sql`)}`);
  client.querySync(sql);
};

try {
  console.log(`-> Connecting to PG using ${process.env.DB_HOST} ...`);
  client.connectSync();
  runSchemaFiles();
  runSeedFiles();
  client.end();
} catch (err) {
  console.error(chalk.red(`Failed due to error: ${err}`));
  client.end();
}


