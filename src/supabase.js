const { createClient } = require("@supabase/supabase-js");

// Initialise a single shared Supabase client for the whole application.
// The anon key is safe to use server-side for auth operations.
// DO NOT expose this file's values in client-side code.

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    "Missing SUPABASE_URL or SUPABASE_ANON_KEY — copy .env.example to .env and fill in your values."
  );
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    // We manage tokens manually (server-side); disable auto-storage.
    persistSession: false,
    autoRefreshToken: false,
    detectSessionFromUrl: false,
  },
});

module.exports = supabase;
