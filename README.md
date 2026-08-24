# Task API

A small CRUD API for managing a to-do list, built with Node.js and Express.
Storage is pluggable: in-memory, **SQLite** (default), or Postgres — selected
by one environment variable.

## Architecture

```
routes (HTTP)  →  service (validation)  →  repository (storage)
```

`src/routes/tasks.routes.js` and `src/services/task.service.js` don't know or
care whether data lives in a JS array, a SQLite file, or a Postgres table —
they only call methods on "a repository" (`getAll`, `getById`, `create`,
`update`, `remove`). `src/repositories/index.js` is the single place that
decides which implementation to use, based on `DB_DRIVER`:

| `DB_DRIVER` | Repository | Data survives restart? |
|-------------|------------|------------------------|
| `memory` | `src/repositories/inMemoryTaskRepository.js` | ❌ |
| `sqlite` | `src/repositories/sqliteTaskRepository.js` | ✅ |
| `postgres` | `src/repositories/postgresTaskRepository.js` | ✅ |

## Why SQLite?

SQLite was chosen for this assignment because:

- **Zero setup** — no separate server process, no Docker required.
- **Single file** — the entire database is one file: `tasks.db` at the project root.
- **Reliable** — used in production by millions of applications (browsers, phones, embedded systems).
- **Perfect for learning** — you can open `tasks.db` in DB Browser for SQLite and run SQL queries directly while the API is live.

## Where is the database file?

```
CRUD_APIs/
└── tasks.db        ← created automatically on first run
```

`tasks.db` is listed in `.gitignore` so it is never committed to version control.
Three example tasks are inserted automatically the **first time** the server starts,
and never again (guarded by `SELECT COUNT(*) FROM tasks`).

## How to start the project

```bash
# 1. Install dependencies (only needed once)
npm install

# 2. Copy the example env file (SQLite is the default)
cp .env.example .env

# 3. Start the server
npm start
```

The server will:
1. Create `tasks.db` if it doesn't exist
2. Create the `tasks` table if it doesn't exist
3. Insert 3 seed tasks if the table is empty
4. Start listening on `http://localhost:3000`

API docs (Swagger UI): `http://localhost:3000/docs`

## Endpoints

| Method | Path          | Description                        | Success | Errors   |
|--------|---------------|------------------------------------|---------|----------|
| GET    | `/`           | API info                           | 200     | —        |
| GET    | `/health`     | Health check                       | 200     | —        |
| GET    | `/tasks`      | List all tasks                     | 200     | —        |
| GET    | `/tasks?search=<text>` | Search tasks by title (LIKE) | 200 | —   |
| GET    | `/tasks?done=true\|false` | Filter by completion  | 200    | —        |
| GET    | `/tasks?sort=title` | Sort alphabetically           | 200    | —        |
| GET    | `/tasks/:id`  | Get one task                       | 200     | 404      |
| POST   | `/tasks`      | Create a task (`{"title": "..."}`) | 201     | 400      |
| PUT    | `/tasks/:id`  | Update a task's title/done         | 200     | 400, 404 |
| DELETE | `/tasks/:id`  | Delete a task                      | 204     | 404      |
| GET    | `/stats`      | Task counts via SQL COUNT()        | 200     | —        |

## Example curl

```bash
# Create a task
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Buy milk"}'

# Response: 201 Created
# {"id":4,"title":"Buy milk","done":false}

# List all tasks
curl http://localhost:3000/tasks

# Search
curl "http://localhost:3000/tasks?search=milk"

# Filter completed
curl "http://localhost:3000/tasks?done=true"

# Get statistics
curl http://localhost:3000/stats
# {"total":3,"completed":1,"pending":2}
```

## Proving persistence

```
1. npm start                          # server starts, seeds 3 tasks
2. POST /tasks {"title":"test"}       # creates task id=4
3. GET /tasks                         # [task1, task2, task3, task4] ← 4 tasks
4. Stop the server (Ctrl+C)
5. npm start again                    # logs: "tasks.db already has 4 row(s) — skipping seed"
6. GET /tasks                         # [task1, task2, task3, task4] ← still 4 tasks ✅
```

## Stage 4 — SQL queries (run in DB Browser for SQLite)

Open `tasks.db` in [DB Browser for SQLite](https://sqlitebrowser.org/) and try:

```sql
-- List every task
SELECT * FROM tasks;

-- Show only completed tasks
SELECT * FROM tasks WHERE done = 1;

-- Count all tasks
SELECT COUNT(*) FROM tasks;

-- Mark every task as completed
UPDATE tasks SET done = 1;

-- Delete all completed tasks
DELETE FROM tasks WHERE done = 1;
```

> **Tip:** Changes made directly in DB Browser are immediately visible through the API — run `GET /tasks` right after to see them.

## Screenshot of DB Browser

> _Open `tasks.db` in DB Browser for SQLite and paste a screenshot here._

## Service/routes unchanged — honestly

`src/services/task.service.js` and `src/routes/tasks.routes.js` are the same
whether `DB_DRIVER=memory`, `DB_DRIVER=sqlite`, or `DB_DRIVER=postgres`.
The only new files for SQLite support are:

- `src/db/sqlite.js` — opens the database, creates the table, seeds data
- `src/repositories/sqliteTaskRepository.js` — the 5-method repository

The only changed file to wire it in is `src/repositories/index.js` (one new
`else if` branch).

## Run with Docker + Postgres (original stack)

```bash
cp .env.example .env
# Edit .env: set DB_DRIVER=postgres and DATABASE_URL
docker compose up
```

## AI vs me (Stage 7, if attempted)

**My prompt:**
<< paste your prompt >>

**What the AI did better:**
<< ... >>

**What it got wrong or ignored:**
<< ... >>

**What I forgot to specify:**
<< ... >>
