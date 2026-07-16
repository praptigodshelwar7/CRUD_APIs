// This is the only place that decides which storage backend is active.
// Everything above it (service, routes) talks to "a repository" and
// never knows or cares whether that's memory or Postgres.

const DRIVER = process.env.DB_DRIVER || "memory";

let repository;

if (DRIVER === "postgres") {
  const PostgresTaskRepository = require("./postgresTaskRepository");
  repository = new PostgresTaskRepository();
} else {
  const InMemoryTaskRepository = require("./inMemoryTaskRepository");
  repository = new InMemoryTaskRepository();
}

module.exports = repository;
