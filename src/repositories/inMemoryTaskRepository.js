// In-memory implementation of the task repository interface.
// Every method returns a Promise so it's a drop-in match for the
// Postgres repository — the service layer never knows which one it's using.
//
// Interface (both repositories implement this):
//   getAll()              -> Promise<Task[]>
//   getById(id)            -> Promise<Task|null>
//   create(title)           -> Promise<Task>
//   update(id, { title, done }) -> Promise<Task|null>
//   remove(id)              -> Promise<boolean>   // true if a row was deleted

class InMemoryTaskRepository {
  constructor() {
    this.tasks = [
      { id: 1, title: "Buy milk", done: false },
      { id: 2, title: "Read a book", done: false },
      { id: 3, title: "Walk the dog", done: true },
    ];
    this.nextId = 4;
  }

  async getAll() {
    return this.tasks;
  }

  async getById(id) {
    return this.tasks.find((t) => t.id === id) || null;
  }

  async create(title) {
    const newTask = { id: this.nextId++, title, done: false };
    this.tasks.push(newTask);
    return newTask;
  }

  async update(id, { title, done }) {
    const task = this.tasks.find((t) => t.id === id);
    if (!task) return null;
    if (title !== undefined) task.title = title;
    if (done !== undefined) task.done = done;
    return task;
  }

  async remove(id) {
    const index = this.tasks.findIndex((t) => t.id === id);
    if (index === -1) return false;
    this.tasks.splice(index, 1);
    return true;
  }
}

module.exports = InMemoryTaskRepository;
