const db = require("../db/sqlite");

// SQLite implementation of the task repository interface.
// Uses better-sqlite3 (synchronous API) wrapped in async methods so the
// service layer — which awaits every call — works without any changes.
//
// Interface (all three repositories implement this):
//   getAll({ search, done, sort })   -> Promise<Task[]>
//   getById(id)                       -> Promise<Task|null>
//   create(title)                     -> Promise<Task>
//   update(id, { title, done })       -> Promise<Task|null>
//   remove(id)                        -> Promise<boolean>

class SQLiteTaskRepository {
  // ── Stage 1: Read ──────────────────────────────────────────────────────────

  async getAll({ search, done, sort } = {}) {
    let sql = "SELECT id, title, done FROM tasks WHERE 1=1";
    const params = [];

    // Optional extra: search using SQL LIKE
    if (search) {
      sql += " AND title LIKE ?";
      params.push(`%${search}%`);
    }

    // Optional extra: filter by done status
    if (done !== undefined) {
      sql += " AND done = ?";
      params.push(done ? 1 : 0);
    }

    // Optional extra: sort alphabetically by title
    if (sort === "title") {
      sql += " ORDER BY title ASC";
    } else {
      sql += " ORDER BY id ASC";
    }

    const rows = db.prepare(sql).all(...params);
    // SQLite stores booleans as 0/1 — normalise to JS boolean
    return rows.map(this._normalise);
  }

  async getById(id) {
    const row = db
      .prepare("SELECT id, title, done FROM tasks WHERE id = ?")
      .get(id);
    return row ? this._normalise(row) : null;
  }

  // ── Stage 2: Create ────────────────────────────────────────────────────────

  async create(title) {
    const info = db
      .prepare("INSERT INTO tasks (title, done) VALUES (?, 0)")
      .run(title);
    return this.getById(info.lastInsertRowid);
  }

  // ── Stage 3: Update ────────────────────────────────────────────────────────

  async update(id, { title, done }) {
    const existing = await this.getById(id);
    if (!existing) return null;

    const newTitle = title !== undefined ? title : existing.title;
    const newDone  = done  !== undefined ? done  : existing.done;

    db.prepare(
      "UPDATE tasks SET title = ?, done = ? WHERE id = ?"
    ).run(newTitle, newDone ? 1 : 0, id);

    return this.getById(id);
  }

  // ── Stage 3: Delete ────────────────────────────────────────────────────────

  async remove(id) {
    const info = db.prepare("DELETE FROM tasks WHERE id = ?").run(id);
    return info.changes > 0;
  }

  // ── Optional extra: statistics ─────────────────────────────────────────────

  async getStats() {
    return db.prepare(`
      SELECT
        COUNT(*)                          AS total,
        SUM(CASE WHEN done = 1 THEN 1 ELSE 0 END) AS completed,
        SUM(CASE WHEN done = 0 THEN 1 ELSE 0 END) AS pending
      FROM tasks
    `).get();
  }

  // ── Helper ─────────────────────────────────────────────────────────────────

  _normalise(row) {
    return { ...row, done: row.done === 1 };
  }
}

module.exports = SQLiteTaskRepository;
