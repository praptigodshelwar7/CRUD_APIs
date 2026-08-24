const Database = require("better-sqlite3");
const path = require("path");

// Store tasks.db at the project root (next to server.js)
// __dirname = CRUD_APIs/src/db  →  ../../  = CRUD_APIs/
const DB_PATH = path.join(__dirname, "..", "..", "tasks.db");

const db = new Database(DB_PATH);

// Enable WAL mode for better concurrent read performance
db.pragma("journal_mode = WAL");

// ─── Stage 0: create table if not exists ────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id    INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT    NOT NULL,
    done  INTEGER NOT NULL DEFAULT 0
  )
`);

// ─── Stage 0: seed three example tasks only when the table is empty ─────────
const count = db.prepare("SELECT COUNT(*) AS n FROM tasks").get().n;
if (count === 0) {
  const insert = db.prepare(
    "INSERT INTO tasks (title, done) VALUES (?, ?)"
  );
  insert.run("Buy milk", 0);
  insert.run("Read a book", 0);
  insert.run("Walk the dog", 1);
  console.log("[sqlite] Seeded 3 example tasks into tasks.db");
} else {
  console.log(`[sqlite] tasks.db already has ${count} row(s) — skipping seed`);
}

module.exports = db;
