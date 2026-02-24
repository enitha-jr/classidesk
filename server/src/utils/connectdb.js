const { Pool } = require("pg");
const config = require("../config/config");

// console.log("DB Config:", config.DB);

const pool = new Pool(config.DB);

module.exports = pool;
