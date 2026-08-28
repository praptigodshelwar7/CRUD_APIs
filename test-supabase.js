require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const s = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
  auth: { persistSession: false }
});

console.log("URL:", process.env.SUPABASE_URL);
console.log("KEY:", process.env.SUPABASE_ANON_KEY ? process.env.SUPABASE_ANON_KEY.slice(0,20) + "..." : "MISSING");

(async () => {
  const { data, error } = await s.auth.signUp({
    email: "hellotest@gmail.com",
    password: "Test1234!"
  });
  console.log("data:", JSON.stringify(data, null, 2));
  console.log("error:", JSON.stringify(error, null, 2));
})();
