const { z } = require("zod");

// ─────────────────────────────────────────────────────────────────────────────
// Schema — every model response is validated against this before leaving the
// service. If the model hallucinates a different shape, callers get a 502, not
// random garbage.
// ─────────────────────────────────────────────────────────────────────────────
const ClassifySchema = z.object({
  category:   z.enum(["work", "personal", "other"]),
  confidence: z.enum(["high", "medium", "low"]),
  reason:     z.string().min(1),
});

// ─────────────────────────────────────────────────────────────────────────────
// callModel — single attempt, aborted after TIMEOUT_MS if no response
// ─────────────────────────────────────────────────────────────────────────────
const TIMEOUT_MS   = 8_000;
const MAX_RETRIES  = 3;

async function callModel(title) {
  const controller = new AbortController();
  const timer      = setTimeout(() => controller.abort(), TIMEOUT_MS);

  const API_KEY = process.env.OPENROUTER_API_KEY;
  if (!API_KEY) throw Object.assign(new Error("OPENROUTER_API_KEY not set"), { status: 500 });

  const prompt = `You are a task classifier. Classify the following task title into exactly one of three categories:
- "work"     → professional, career, or business tasks
- "personal" → personal life, health, family, hobbies, errands
- "other"    → ambiguous or uncategorizable tasks

Respond with ONLY valid JSON matching this exact shape (no markdown, no extra keys):
{"category":"<work|personal|other>","confidence":"<high|medium|low>","reason":"<one sentence>"}

Task title: "${title}"`;

  let res;
  try {
    res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method:  "POST",
      signal:  controller.signal,
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${API_KEY}`,
        "HTTP-Referer":  "http://localhost:3000",
        "X-Title":       "Auth API - W7 Assignment",
      },
      body: JSON.stringify({
        model:       "openrouter/auto",
        messages:    [{ role: "user", content: prompt }],
        temperature: 0.2,
        max_tokens:  120,
      }),
    });
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    const err  = new Error(`Model API error ${res.status}: ${body}`);
    err.status = res.status >= 500 ? 502 : res.status;
    err.retryable = res.status >= 500;
    throw err;
  }

  const json    = await res.json();
  const content = json.choices?.[0]?.message?.content ?? "";

  // Strip optional markdown fences the model sometimes wraps around JSON
  const cleaned = content.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    const err = new Error(`Model returned non-JSON: ${content.slice(0, 120)}`);
    err.status = 502;
    err.retryable = false;
    throw err;
  }

  // Validate against schema — throws ZodError if shape is wrong
  const result = ClassifySchema.safeParse(parsed);
  if (!result.success) {
    const err = new Error(`Schema mismatch: ${result.error.message}`);
    err.status = 502;
    err.retryable = false;
    throw err;
  }

  return result.data;
}

// ─────────────────────────────────────────────────────────────────────────────
// classifyTask — public entry point with exponential-backoff retry
//
// Retries on:  network errors, AbortError (timeout), 5xx from model API
// Stops on:    4xx (bad request to model), schema errors (our bug, not transient)
// ─────────────────────────────────────────────────────────────────────────────
async function classifyTask(title) {
  let lastErr;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await callModel(title);
    } catch (err) {
      lastErr = err;

      // Don't retry on abort (timeout) or non-retryable errors
      const isTimeout   = err.name === "AbortError";
      const isRetryable = isTimeout || err.retryable !== false;

      if (!isRetryable || attempt === MAX_RETRIES) break;

      // Exponential back-off: 200 ms, 400 ms, …
      await new Promise(r => setTimeout(r, 200 * 2 ** (attempt - 1)));
    }
  }

  // Re-throw with a clean status code
  if (!lastErr.status) lastErr.status = 502;
  throw lastErr;
}

module.exports = { classifyTask };
