# Auth API

A secure REST API built with **Node.js + Express** and **Supabase Auth**.
Users can sign up, log in, and receive a **JWT (Access Token)** that they
present on every protected request. The server verifies the token with
Supabase before allowing access.

## Architecture

```
Client
  │
  ├─ POST /auth/signup  ──────────────────► Supabase Auth (creates user)
  ├─ POST /auth/login   ──────────────────► Supabase Auth (returns JWT)
  │
  ├─ GET  /public/info  ──── no auth ────► Route Handler
  │
  └─ GET  /protected/*  ─► authenticate() middleware
                               │ supabase.auth.getUser(token)
                               ├─ invalid → 401
                               └─ valid   → Route Handler → 200 + data
```

## Setup

### 1. Prerequisites

- Node.js ≥ 18
- A free [Supabase](https://supabase.com) account with a project created

### 2. Get your Supabase credentials

1. Go to your Supabase project dashboard
2. Navigate to **Project Settings → API**
3. Copy your **Project URL** and **anon / public** key

### 3. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and fill in your values:

```env
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-anon-public-key-here
PORT=3000
```

> ⚠️ **Never commit `.env` to Git.** It is listed in `.gitignore`.

### 4. Install and run

```bash
npm install
npm start
```

Expected output:
```
Server running and connected to Supabase
Listening at http://localhost:3000
Swagger UI  at http://localhost:3000/docs
```

## API Reference

| Method | Path | Auth required | Success | Error |
|--------|------|---------------|---------|-------|
| POST | `/auth/signup` | ❌ | 201 | 400 |
| POST | `/auth/login`  | ❌ | 200 + tokens | 400, 401 |
| POST | `/auth/logout` | ✅ Bearer | 204 | 401 |
| GET  | `/public/info` | ❌ | 200 | — |
| GET  | `/protected/profile`   | ✅ Bearer | 200 | 401 |
| GET  | `/protected/dashboard` | ✅ Bearer | 200 | 401 |

## Status Codes

| Code | Meaning |
|------|---------|
| 201 | Account created |
| 200 | Success |
| 204 | Logged out (no body) |
| 400 | Missing email / password |
| 401 | Missing, invalid, or expired token |

## Example curl walkthrough

```bash
# 1. Sign up
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com","password":"password123"}'

# 2. Log in — copy the access_token from the response
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com","password":"password123"}'

# 3. Access public route (no token needed)
curl http://localhost:3000/public/info

# 4. Access protected profile (paste your token)
curl http://localhost:3000/protected/profile \
  -H "Authorization: Bearer <your_access_token>"

# 5. Log out
curl -X POST http://localhost:3000/auth/logout \
  -H "Authorization: Bearer <your_access_token>"
```

## Swagger UI

Open `http://localhost:3000/docs` in your browser.

Protected routes show a **🔒 lock icon**. To authorize:
1. Click the **Authorize 🔒** button (top right)
2. Paste the `access_token` from `POST /auth/login`
3. Click **Authorize** → all protected "Try it out" requests will include your token automatically

## How authentication works

```
1. Client   →  POST /auth/login (email + password)
2. Server   →  Supabase validates credentials
3. Supabase →  Returns JWT (access_token)
4. Client   →  Sends JWT in Authorization: Bearer <token>
5. Server   →  authenticate() middleware calls supabase.auth.getUser(token)
6. Supabase →  Verifies signature + expiry
7. Server   →  Attaches req.user, calls next() → route handler runs
```

## Project structure

```
Auth_API/
├── server.js                        # Entry point
├── openapi.json                     # Swagger / OpenAPI 3.0 spec
├── .env.example                     # Env var template (safe to commit)
├── .gitignore                       # Excludes .env and node_modules
└── src/
    ├── app.js                       # Express app wiring
    ├── supabase.js                  # Supabase singleton client
    ├── middleware/
    │   └── auth.middleware.js       # Reusable Bearer token verifier
    └── routes/
        ├── auth.routes.js           # /auth/signup, /auth/login, /auth/logout
        ├── public.routes.js         # /public/info
        └── protected.routes.js     # /protected/profile, /protected/dashboard
```
