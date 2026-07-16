const express = require("express");
const taskService = require("../services/task.service");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    res.json(await taskService.listTasks());
  } catch (err) {
    next(err);
  }
});

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

router.post("/", async (req, res, next) => {
  try {
    const { title } = req.body || {};
    const newTask = await taskService.createTask(title);
    res.status(201).json(newTask);
  } catch (err) {
    next(err);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const { title, done } = req.body || {};
    const updated = await taskService.updateTask(Number(req.params.id), { title, done });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    await taskService.deleteTask(Number(req.params.id));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
