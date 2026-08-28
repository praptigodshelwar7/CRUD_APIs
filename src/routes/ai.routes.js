const express = require("express");
const { authenticate }  = require("../middleware/auth.middleware");
const { classifyTask }  = require("../services/llm.service");

const router = express.Router();

// ─── POST /ai/classify-task ───────────────────────────────────────────────────
// W7 — Calls an LLM to classify a task title as work / personal / other.
//
// Request body : { "title": "string" }
// Response 200 : { "category": "work|personal|other",
//                  "confidence": "high|medium|low",
//                  "reason": "string" }
// Response 400 : missing or empty title
// Response 502 : model returned invalid / unparseable output
// Response 401 : handled by authenticate middleware
// ─────────────────────────────────────────────────────────────────────────────
router.post("/classify-task", authenticate, async (req, res, next) => {
  const { title } = req.body ?? {};

  // Validate input before touching the model
  if (!title || typeof title !== "string" || title.trim() === "") {
    return res.status(400).json({ error: "title is required and must be a non-empty string" });
  }

  if (title.trim().length > 500) {
    return res.status(400).json({ error: "title must be 500 characters or fewer" });
  }

  try {
    const result = await classifyTask(title.trim());
    return res.status(200).json(result);
  } catch (err) {
    next(err); // handled by central error handler in app.js
  }
});

module.exports = router;
