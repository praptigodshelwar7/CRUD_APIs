CREATE TABLE IF NOT EXISTS tasks (
  id    SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  done  BOOLEAN NOT NULL DEFAULT FALSE
);

-- Seed data so a fresh container starts with the same tasks
-- the in-memory version used to. This file only runs once —
-- Postgres executes docker-entrypoint-initdb.d scripts only when
-- the data volume is empty (i.e. on first container creation).
INSERT INTO tasks (title, done) VALUES
  ('Buy milk', false),
  ('Read a book', false),
  ('Walk the dog', true);
