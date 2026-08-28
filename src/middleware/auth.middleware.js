const supabase = require("../supabase");

// ─────────────────────────────────────────────────────────────────────────────
// authenticate — reusable Express middleware (Stage 4)
//
// Reads the Authorization header, extracts the Bearer token, and calls
// supabase.auth.getUser(token) to verify it server-side.
//
// DEV BYPASS: if DEV_BYPASS_TOKEN is set in .env and the request sends that
// exact token, Supabase is skipped entirely (useful when Supabase is paused).
//
// On success  → attaches req.user and calls next()
// On failure  → sends 401 immediately so the route handler never runs
// ─────────────────────────────────────────────────────────────────────────────

async function authenticate(req, res, next) {
  const authHeader = req.headers["authorization"] || req.headers["Authorization"];

  // Header must exist and follow the "Bearer <token>" format
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Access token required" });
  }

  const token = authHeader.slice(7); // strip "Bearer "

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  // ── DEV BYPASS (only active when DEV_BYPASS_TOKEN is set in .env) ──────────
  const bypassToken = process.env.DEV_BYPASS_TOKEN;
  if (bypassToken && token === bypassToken) {
    if (process.env.NODE_ENV !== "test") {
      console.warn("[DEV] Auth bypass active — not for production use");
    }
    req.user  = { id: "dev-user", email: "dev@localhost", created_at: new Date().toISOString() };
    req.token = token;
    return next();
  }
  // ───────────────────────────────────────────────────────────────────────────

  // Ask Supabase to verify the token — it checks signature + expiry
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data?.user) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  // Attach the verified user so route handlers can read req.user
  req.user  = data.user;
  req.token = token; // needed by /auth/logout
  next();
}

module.exports = { authenticate };
