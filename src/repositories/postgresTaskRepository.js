const pool = require("../db/pool");

// Postgres implementation of the task repository interface.
// Same method signatures/return shapes as InMemoryTaskRepository —
// that's what lets the service and routes stay untouched.

class PostgresTaskRepository {
  async getAll() {
    const { rows } = await pool.query(
      "SELECT id, title, done FROM tasks ORDER BY id"
    );
    return rows;
  }

  async getById(id) {
    const { rows } = await pool.query(
      "SELECT id, title, done FROM tasks WHERE id = $1",
      [id]
    );
    return rows[0] || null;
  }

  async create(title) {
    const { rows } = await pool.query(
      "INSERT INTO tasks (title, done) VALUES ($1, false) RETURNING id, title, done",
      [title]
    );
    return rows[0];
  }

  async update(id, { title, done }) {
    const existing = await this.getById(id);
    if (!existing) return null;

    const newTitle = title !== undefined ? title : existing.title;
    const newDone = done !== undefined ? done : existing.done;

    const { rows } = await pool.query(
      "UPDATE tasks SET title = $1, done = $2 WHERE id = $3 RETURNING id, title, done",
      [newTitle, newDone, id]
    );
    return rows[0];
  }

  async remove(id) {
    const { rowCount } = await pool.query("DELETE FROM tasks WHERE id = $1", [id]);
    return rowCount > 0;
  }
}

module.exports = PostgresTaskRepository;
