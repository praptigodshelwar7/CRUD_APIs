// W7 — LLM endpoint test suite (8 cases)
//
// BEFORE RUNNING:
//   1. Make sure the server is running:  npm run dev
//   2. Log in first to get a token:      POST /auth/login
//   3. Set TOKEN below (or set env var BEARER_TOKEN)
//   4. Run:  node test-llm.js
//
// All tests run in sequence; each prints [OK] or [FAIL].

const BASE  = "http://localhost:3000";

// ── Token: use the DEV_BYPASS_TOKEN from .env, or export BEARER_TOKEN=... ────
// The bypass token lets tests run even when Supabase is paused (free tier).
// In production, set BEARER_TOKEN to a real Supabase JWT.
const TOKEN = process.env.BEARER_TOKEN || "dev-test-token-w7";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
async function req(body, token = TOKEN) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res  = await fetch(`${BASE}/ai/classify-task`, {
    method:  "POST",
    headers,
    body:    body !== undefined ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = text; }
  return { status: res.status, body: json };
}

let passed = 0;
let failed = 0;

function check(label, condition, detail = "") {
  if (condition) {
    console.log(`  [OK  ] ${label}`);
    passed++;
  } else {
    console.log(`  [FAIL] ${label}${detail ? ` — ${detail}` : ""}`);
    failed++;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────────
(async () => {
  // ── Test 1: Valid work title → 200 + correct top-level shape ─────────────────
  console.log("\n=== Test 1: Valid work title → 200 + correct schema shape ===");
  {
    const r = await req({ title: "Prepare slides for the Q3 board meeting" });
    check("status 200", r.status === 200, `got ${r.status}`);
    check("has category",   typeof r.body.category   === "string", JSON.stringify(r.body));
    check("has confidence", typeof r.body.confidence === "string", JSON.stringify(r.body));
    check("has reason",     typeof r.body.reason     === "string", JSON.stringify(r.body));
    console.log(`  → category=${r.body.category}  confidence=${r.body.confidence}`);
    console.log(`  → reason: ${r.body.reason}`);
  }

  // ── Test 2: category is strictly one of the three allowed values ──────────────
  console.log("\n=== Test 2: category is one of work | personal | other ===");
  {
    const r = await req({ title: "Take the dog to the vet" });
    check("status 200", r.status === 200, `got ${r.status}`);
    const validCategories = ["work", "personal", "other"];
    check(
      `category "${r.body.category}" is valid enum value`,
      validCategories.includes(r.body.category),
      `got "${r.body.category}"`
    );
  }

  // ── Test 3: confidence is strictly one of high | medium | low ────────────────
  console.log("\n=== Test 3: confidence is one of high | medium | low ===");
  {
    const r = await req({ title: "Buy milk" });
    check("status 200", r.status === 200, `got ${r.status}`);
    const validConfidences = ["high", "medium", "low"];
    check(
      `confidence "${r.body.confidence}" is valid enum value`,
      validConfidences.includes(r.body.confidence),
      `got "${r.body.confidence}"`
    );
  }

  // ── Test 4: Missing title field → 400 ────────────────────────────────────────
  console.log("\n=== Test 4: Missing title field → 400 ===");
  {
    const r = await req({});
    check("status 400", r.status === 400, `got ${r.status}`);
    check("error field present", typeof r.body.error === "string", JSON.stringify(r.body));
    console.log(`  → error: ${r.body.error}`);
  }

  // ── Test 5: Empty string title → 400 ─────────────────────────────────────────
  console.log("\n=== Test 5: Empty string title → 400 ===");
  {
    const r = await req({ title: "   " });
    check("status 400", r.status === 400, `got ${r.status}`);
    check("error field present", typeof r.body.error === "string", JSON.stringify(r.body));
    console.log(`  → error: ${r.body.error}`);
  }

  // ── Test 6: Very long title (500 chars) → 200 + valid schema ─────────────────
  console.log("\n=== Test 6: 500-character title → 200 + valid schema ===");
  {
    const longTitle = "Review the comprehensive annual performance report ".repeat(10).slice(0, 500);
    const r = await req({ title: longTitle });
    check("status 200", r.status === 200, `got ${r.status}`);
    const validCats  = ["work", "personal", "other"];
    const validConfs = ["high", "medium", "low"];
    check("valid category",   validCats.includes(r.body.category),   `got "${r.body.category}"`);
    check("valid confidence", validConfs.includes(r.body.confidence), `got "${r.body.confidence}"`);
    check("has reason",       typeof r.body.reason === "string" && r.body.reason.length > 0);
  }

  // ── Test 7: Non-English title → 200 + valid schema ───────────────────────────
  console.log("\n=== Test 7: Non-English title (Hindi) → 200 + valid schema ===");
  {
    const r = await req({ title: "बोर्ड मीटिंग के लिए प्रेजेंटेशन तैयार करें" }); // "Prepare presentation for board meeting"
    check("status 200", r.status === 200, `got ${r.status}`);
    const validCats  = ["work", "personal", "other"];
    const validConfs = ["high", "medium", "low"];
    check("valid category",   validCats.includes(r.body.category),   `got "${r.body.category}"`);
    check("valid confidence", validConfs.includes(r.body.confidence), `got "${r.body.confidence}"`);
    check("has reason",       typeof r.body.reason === "string" && r.body.reason.length > 0);
    console.log(`  → category=${r.body.category}  confidence=${r.body.confidence}`);
  }

  // ── Test 8: No auth token → 401 ──────────────────────────────────────────────
  console.log("\n=== Test 8: No auth token → 401 ===");
  {
    const r = await req({ title: "Schedule team standup" }, null);
    check("status 401", r.status === 401, `got ${r.status}`);
    check("error field present", typeof r.body.error === "string", JSON.stringify(r.body));
    console.log(`  → error: ${r.body.error}`);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  console.log(`\n${"─".repeat(50)}`);
  console.log(`Results: ${passed} passed, ${failed} failed out of ${passed + failed} checks`);
  if (failed === 0) {
    console.log("✅  All checks passed!\n");
  } else {
    console.log("❌  Some checks failed — see [FAIL] lines above.\n");
    process.exit(1);
  }
})();
