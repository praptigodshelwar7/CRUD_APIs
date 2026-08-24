const express = require("express");
const { authenticate } = require("../middleware/auth.middleware");

const router = express.Router();

// All routes in this file are protected by the authenticate middleware.
// The middleware runs first; if it calls next(), the route handler executes.
// If the token is missing/invalid, middleware returns 401 and the handler
// is never reached.

// ─── GET /protected/profile ───────────────────────────────────────────────────
// Stage 3 — Returns the verified user's profile data
// Header: Authorization: Bearer <token>
// 200  with user metadata if token is valid
// 401  handled by middleware
// ─────────────────────────────────────────────────────────────────────────────
router.get("/profile", authenticate, (req, res) => {
  const { id, email, created_at, last_sign_in_at, user_metadata } = req.user;

  return res.status(200).json({
    message: "Access granted. Here is your profile.",
    user: {
      id,
      email,
      created_at,
      last_sign_in_at,
      user_metadata,
    },
  });
});

// ─── GET /protected/dashboard ────────────────────────────────────────────────
// Stage 4 — A second protected route to demonstrate reusable middleware
// Header: Authorization: Bearer <token>
// 200  with dashboard data if token is valid
// 401  handled by middleware
// ─────────────────────────────────────────────────────────────────────────────
router.get("/dashboard", authenticate, (req, res) => {
  return res.status(200).json({
    message: `Welcome to your dashboard, ${req.user.email}!`,
    stats: {
      user_id:    req.user.id,
      logged_in:  true,
      server_time: new Date().toISOString(),
    },
  });
});

module.exports = router;
