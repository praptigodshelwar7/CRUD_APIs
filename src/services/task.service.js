const repository = require("../repositories");

// Validation/business-rules live here, once, regardless of storage backend.

// Optional query filters (search, done, sort) are passed straight through to
// the repository — only the SQLite repo acts on them; others ignore extras.
async function listTasks(filters = {}) {
  return repository.getAll(filters);
}

async function getTask(id) {
  return repository.getById(id);
}

async function createTask(title) {
  if (!title || typeof title !== "string" || title.trim() === "") {
    const err = new Error("title is required");
    err.status = 400;
    throw err;
  }
  return repository.create(title.trim());
}

async function updateTask(id, { title, done }) {
  if (title === undefined && done === undefined) {
    const err = new Error("provide title and/or done to update");
    err.status = 400;
    throw err;
  }
  if (title !== undefined && (typeof title !== "string" || title.trim() === "")) {
    const err = new Error("title must be a non-empty string");
    err.status = 400;
    throw err;
  }
  if (done !== undefined && typeof done !== "boolean") {
    const err = new Error("done must be a boolean");
    err.status = 400;
    throw err;
  }

  const updated = await repository.update(id, {
    title: title !== undefined ? title.trim() : undefined,
    done,
  });
  if (!updated) {
    const err = new Error(`Task ${id} not found`);
    err.status = 404;
    throw err;
  }
  return updated;
}

async function deleteTask(id) {
  const deleted = await repository.remove(id);
  if (!deleted) {
    const err = new Error(`Task ${id} not found`);
    err.status = 404;
    throw err;
  }
}

// Optional extra — only works when repository implements getStats()
async function getTaskStats() {
  if (typeof repository.getStats !== "function") {
    const err = new Error("Stats not supported by the current storage backend");
    err.status = 501;
    throw err;
  }
  return repository.getStats();
}

module.exports = { listTasks, getTask, createTask, updateTask, deleteTask, getTaskStats };

