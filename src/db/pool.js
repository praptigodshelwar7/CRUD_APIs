const { Pool } = require("pg");

// DATABASE_URL comes from .env (see .env.example), e.g.:
// postgres://postgres:postgres@localhost:5432/taskdb
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set — copy .env.example to .env and fill it in");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

module.exports = pool;
