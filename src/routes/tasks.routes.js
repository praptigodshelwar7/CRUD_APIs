const express = require("express");
const taskService = require("../services/task.service");

const router = express.Router();

// GET /tasks
// Optional query params (all work together):
//   ?search=<text>   — SQL LIKE filter on title
//   ?done=true|false — filter by completion status
//   ?sort=title      — alphabetical ordering
router.get("/", async (req, res, next) => {
  try {
    const { search, done, sort } = req.query;
    const doneFilter =
      done === "true" ? true : done === "false" ? false : undefined;
    res.json(await taskService.listTasks({ search, done: doneFilter, sort }));
  } catch (err) {
    next(err);
  }
});

// GET /tasks/:id
router.get("/:id", async (req, res, next) => {
  try {
    const task = await taskService.getTask(Number(req.params.id));
    if (!task) {
      return res.status(404).json({ error: `Task ${req.params.id} not found` });
    }
    res.json(task);
  } catch (err) {
    next(err);
  }
});

// POST /tasks
router.post("/", async (req, res, next) => {
  try {
    const { title } = req.body || {};
    const newTask = await taskService.createTask(title);
    res.status(201).json(newTask);
  } catch (err) {
    next(err);
  }
});

// PUT /tasks/:id
router.put("/:id", async (req, res, next) => {
  try {
    const { title, done } = req.body || {};
    const updated = await taskService.updateTask(Number(req.params.id), { title, done });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// DELETE /tasks/:id
router.delete("/:id", async (req, res, next) => {
  try {
    await taskService.deleteTask(Number(req.params.id));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
