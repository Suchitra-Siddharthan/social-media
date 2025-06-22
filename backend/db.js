const oracledb = require('oracledb');

oracledb.initOracleClient(); // Optional if environment is set up correctly

const dbConfig = {
  user: "system",              // your working username
  password: "suchi3590",       // your password
  connectString: "localhost:1521/XEPDB1" // default for Oracle 21c XE
};

module.exports = dbConfig;
