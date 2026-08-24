const express = require("express");

const router = express.Router();

// ─── GET /public/info ─────────────────────────────────────────────────────────
// Stage 2 — Fully public endpoint, no authentication required
// 200 always
// ─────────────────────────────────────────────────────────────────────────────
router.get("/info", (req, res) => {
  res.status(200).json({
    message: "Welcome stranger! This info is public.",
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
