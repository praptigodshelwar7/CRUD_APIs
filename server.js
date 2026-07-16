require("dotenv").config();
const app = require("./src/app");

const PORT = process.env.PORT || 3000;
const DRIVER = process.env.DB_DRIVER || "memory";

app.listen(PORT, () => {
  console.log(`Task API listening at http://localhost:${PORT}`);
  console.log(`Swagger UI at http://localhost:${PORT}/docs`);
  console.log(`Storage backend: ${DRIVER}`);
});
