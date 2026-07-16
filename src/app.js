const express = require("express");
const swaggerUi = require("swagger-ui-express");
const openapiSpec = require("../openapi.json");
const tasksRouter = require("./routes/tasks.routes");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    name: "Task API",
    version: "1.0",
    endpoints: ["/tasks"],
  });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/tasks", tasksRouter);

app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapiSpec));

// Central error handler — reads the .status set by the service layer
app.use((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({ error: err.message || "Internal server error" });
});

module.exports = app;
