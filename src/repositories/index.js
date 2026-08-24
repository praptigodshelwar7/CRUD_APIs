// This is the only place that decides which storage backend is active.
// Everything above it (service, routes) talks to "a repository" and
// never knows or cares whether that's memory, Postgres, or SQLite.
//
// DB_DRIVER values:
//   memory   -> InMemoryTaskRepository  (no DB needed, resets on restart)
//   sqlite   -> SQLiteTaskRepository    (tasks.db file, survives restarts)
//   postgres -> PostgresTaskRepository  (requires DATABASE_URL + Postgres)

const DRIVER = process.env.DB_DRIVER || "memory";

let repository;

if (DRIVER === "postgres") {
  const PostgresTaskRepository = require("./postgresTaskRepository");
  repository = new PostgresTaskRepository();
} else if (DRIVER === "sqlite") {
  const SQLiteTaskRepository = require("./sqliteTaskRepository");
  repository = new SQLiteTaskRepository();
} else {
  const InMemoryTaskRepository = require("./inMemoryTaskRepository");
  repository = new InMemoryTaskRepository();
}

module.exports = repository;
