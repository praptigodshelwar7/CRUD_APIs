# Task API

A small CRUD API for managing a to-do list, built with Node.js and Express.
Storage is pluggable: an in-memory repository (data resets on restart) or a
Postgres repository (data survives restarts), selected by one env var.

## Architecture

```
routes (HTTP)  ->  service (validation)  ->  repository (storage)
```

`src/routes/tasks.routes.js` and `src/services/task.service.js` don't know or
care whether the data lives in a JS array or a Postgres table — they only
call methods on "a repository" (`getAll`, `getById`, `create`, `update`,
`remove`). `src/repositories/index.js` is the single place that decides
which implementation to hand them, based on `DB_DRIVER`:

- `DB_DRIVER=memory` -> `src/repositories/inMemoryTaskRepository.js`
- `DB_DRIVER=postgres` -> `src/repositories/postgresTaskRepository.js`

Swapping storage backends was a one-line env var change — the route and
service files were not touched.

## Run it (Docker + Postgres — the real stack)

```bash
cp .env.example .env
docker compose up
```

This starts Postgres (with a named volume `pgdata`, so data survives
container restarts) and the app together. On first startup, `db/init.sql`
creates the `tasks` table and seeds it.

Server: `http://localhost:3000`
Swagger UI: `http://localhost:3000/docs`

## Run it locally without Docker (in-memory mode)

```bash
npm install
DB_DRIVER=memory npm start
```

## Endpoints

| Method | Path          | Description                    | Success | Errors        |
|--------|---------------|---------------------------------|---------|---------------|
| GET    | `/`           | API info                        | 200     | —             |
| GET    | `/health`     | Health check                    | 200     | —             |
| GET    | `/tasks`      | List all tasks                  | 200     | —             |
| GET    | `/tasks/:id`  | Get one task                    | 200     | 404           |
| POST   | `/tasks`      | Create a task (`{"title": ""}`) | 201     | 400           |
| PUT    | `/tasks/:id`  | Update a task's title/done      | 200     | 400, 404      |
| DELETE | `/tasks/:id`  | Delete a task                   | 204     | 404           |

## Example

```
$ curl -i -X POST http://localhost:3000/tasks -H "Content-Type: application/json" -d '{"title":"Buy milk"}'

<< PASTE YOUR curl -i OUTPUT HERE >>
```

## Swagger screenshot

<< PASTE YOUR SCREENSHOT HERE >>

## Proving persistence

<< Run this yourself and paste your actual output — steps below >>

1. `docker compose up -d`
2. `curl -X POST http://localhost:3000/tasks -H "Content-Type: application/json" -d '{"title":"Survive a restart"}'`
3. `curl http://localhost:3000/tasks` — note the new row is there.
4. `docker compose down` (stops and removes the app + db *containers*,
   but the `pgdata` volume is not deleted) then `docker compose up -d` again.
5. `curl http://localhost:3000/tasks` again — the row from step 2 is still
   there, because Postgres wrote it to the `pgdata` volume, not to the
   container's writable layer.

## Service/routes unchanged — honestly

`src/services/task.service.js` and `src/routes/tasks.routes.js` are the same
whether `DB_DRIVER=memory` or `DB_DRIVER=postgres`. The only new files for
Postgres support are `src/repositories/postgresTaskRepository.js`,
`src/db/pool.js`, and `db/init.sql`; the only changed file to wire it in is
`src/repositories/index.js`.

## AI vs me (Stage 7, if attempted)

**My prompt:**
<< paste your prompt >>

**What the AI did better:**
<< ... >>

**What it got wrong or ignored:**
<< ... >>

**What I forgot to specify:**
<< ... >>
