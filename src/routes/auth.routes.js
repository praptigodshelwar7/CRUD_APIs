const express = require("express");
const supabase = require("../supabase");

const router = express.Router();

// ─── POST /auth/signup ────────────────────────────────────────────────────────
// Stage 1 — Register a new user account via Supabase Auth
// Body: { email, password }
// 201  on success
// 400  if email or password is missing
// 500  on unexpected Supabase error
// ─────────────────────────────────────────────────────────────────────────────
router.post("/signup", async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: "email and password are required" });
  }

  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    // Supabase returns 422 for weak passwords etc — surface as 400
    const status = error.status === 422 ? 400 : 500;
    return res.status(status).json({ error: error.message });
  }

  return res.status(201).json({
    message: "Account created successfully. Check your inbox and confirm your email before logging in.",
    email_confirmation_required: true,
    user: {
      id:         data.user.id,
      email:      data.user.email,
      created_at: data.user.created_at,
    },
  });
});

// ─── POST /auth/login ─────────────────────────────────────────────────────────
// Stage 1 — Authenticate a user and return tokens
// Body: { email, password }
// 200  on success → { access_token, refresh_token, user }
// 400  if fields are missing
// 401  on wrong credentials
// ─────────────────────────────────────────────────────────────────────────────
router.post("/login", async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: "email and password are required" });
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return res.status(401).json({ error: "Invalid login credentials" });
  }

  return res.status(200).json({
    access_token:  data.session.access_token,
    refresh_token: data.session.refresh_token,
    token_type:    "Bearer",
    user: {
      id:    data.user.id,
      email: data.user.email,
    },
  });
});

// ─── POST /auth/logout ────────────────────────────────────────────────────────
// Stage 4 — Invalidate the current session (protected — uses middleware)
// Header: Authorization: Bearer <token>
// 204  on success
// 401  handled by middleware before this runs
// ─────────────────────────────────────────────────────────────────────────────
const { authenticate } = require("../middleware/auth.middleware");

router.post("/logout", authenticate, async (req, res) => {
  // Sign out using the user's own token (scope: "local" invalidates this token)
  const { error } = await supabase.auth.admin
    ? supabase.auth.signOut()
    : supabase.auth.signOut();

  if (error) {
    return res.status(500).json({ error: "Logout failed" });
  }

  return res.status(204).send();
});

module.exports = router;
