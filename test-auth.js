// Auth API — staged verification
// 
// BEFORE RUNNING:
//   1. Sign up once: POST /auth/signup with your email
//   2. Confirm the email in your inbox
//   3. Set EMAIL and PASSWORD below to your confirmed account
//   Then: node test-auth.js

const BASE     = "http://localhost:3000";
const EMAIL    = "hellotest@gmail.com";   // ← confirmed Supabase account
const PASSWORD = "Test1234!";             // ← your password

async function req(method, path, body, token) {
  const opts = { method, headers: { "Content-Type": "application/json" } };
  if (body)  opts.body = JSON.stringify(body);
  if (token) opts.headers["Authorization"] = `Bearer ${token}`;
  const res  = await fetch(BASE + path, opts);
  const text = await res.text();
  let json; try { json = JSON.parse(text); } catch { json = text; }
  return { status: res.status, body: json };
}

function check(label, expected, got) {
  const pass = String(got) === String(expected);
  console.log(`  [${pass ? "OK  " : "FAIL"}] ${label}: expected=${expected} got=${got}`);
  return pass;
}

(async () => {
  console.log("=== Stage 0: Health ===");
  let r = await req("GET", "/health");
  check("status 200", 200, r.status);

  // ── Stage 1 ───────────────────────────────────────────────────────────────
  console.log("\n=== Stage 1: Signup — missing fields → 400 ===");
  r = await req("POST", "/auth/signup", { email: EMAIL });
  check("status 400", 400, r.status);

  console.log("\n=== Stage 1: Login with confirmed account ===");
  r = await req("POST", "/auth/login", { email: EMAIL, password: PASSWORD });
  check("status 200", 200, r.status);
  check("has access_token", true, !!r.body.access_token);
  const token = r.body.access_token;
  console.log("  token:", token ? token.slice(0, 40) + "..." : "MISSING");

  console.log("\n=== Stage 1: Login — wrong password → 401 ===");
  r = await req("POST", "/auth/login", { email: EMAIL, password: "wrongpass" });
  check("status 401", 401, r.status);

  // ── Stage 2 ───────────────────────────────────────────────────────────────
  console.log("\n=== Stage 2: GET /public/info → 200 ===");
  r = await req("GET", "/public/info");
  check("status 200", 200, r.status);
  console.log("  message:", r.body.message);

  console.log("\n=== Stage 2: GET /protected/profile (no token) → 401 ===");
  r = await req("GET", "/protected/profile");
  check("status 401", 401, r.status);
  console.log("  error:", r.body.error);

  // ── Stage 3 ───────────────────────────────────────────────────────────────
  console.log("\n=== Stage 3: GET /protected/profile (valid token) → 200 ===");
  r = await req("GET", "/protected/profile", null, token);
  check("status 200", 200, r.status);
  console.log("  user.email:", r.body.user?.email);

  console.log("\n=== Stage 3: GET /protected/profile (tampered token) → 401 ===");
  r = await req("GET", "/protected/profile", null, token + "X");
  check("status 401", 401, r.status);
  console.log("  error:", r.body.error);

  // ── Stage 4 ───────────────────────────────────────────────────────────────
  console.log("\n=== Stage 4: GET /protected/dashboard (valid token) → 200 ===");
  r = await req("GET", "/protected/dashboard", null, token);
  check("status 200", 200, r.status);
  console.log("  message:", r.body.message);

  console.log("\n=== Stage 4: POST /auth/logout → 204 ===");
  r = await req("POST", "/auth/logout", null, token);
  check("status 204", 204, r.status);

  console.log("\n✅ All checks done!\n");
})();
