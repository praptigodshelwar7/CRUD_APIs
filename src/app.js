const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const openapiSpec = require("../openapi.json");

const authRouter      = require("./routes/auth.routes");
const publicRouter    = require("./routes/public.routes");
const protectedRouter = require("./routes/protected.routes");

const app = express();

// ── Global middleware ─────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Root info ─────────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    name:    "Auth API",
    version: "1.0",
    docs:    "/docs",
    endpoints: [
      "POST /auth/signup",
      "POST /auth/login",
      "POST /auth/logout",
      "GET  /public/info",
      "GET  /protected/profile",
      "GET  /protected/dashboard",
    ],
  });
});

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/health", (req, res) => res.json({ status: "ok" }));

// ── Feature routers ───────────────────────────────────────────────────────────
app.use("/auth",      authRouter);
app.use("/public",    publicRouter);
app.use("/protected", protectedRouter);

// ── Swagger UI (Stage 5) ──────────────────────────────────────────────────────
app.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(openapiSpec, {
    swaggerOptions: {
      persistAuthorization: true, // keeps token between page refreshes
    },
  })
);

// ── Central error handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || "Internal server error" });
});

module.exports = app;
