require("dotenv").config();
const app = require("./src/app");

// Eagerly import supabase to validate env vars on startup
// (throws immediately if SUPABASE_URL / SUPABASE_ANON_KEY are missing)
require("./src/supabase");

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running and connected to Supabase`);
  console.log(`Listening at http://localhost:${PORT}`);
  console.log(`Swagger UI  at http://localhost:${PORT}/docs`);
});
