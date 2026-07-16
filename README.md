# Task API

A small CRUD API for managing a to-do list, built with Node.js and Express.
Data is stored in memory — it resets whenever the server restarts.

## Run it

```bash
npm install
npm start
```

Server runs at `http://localhost:3000`.
Swagger UI (interactive docs): `http://localhost:3000/docs`

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

{
  "id": 4,
  "title": "Buy milk",
  "done": false
}
```

## Swagger screenshot

<img width="1061" height="664" alt="image" src="https://github.com/user-attachments/assets/ef52d93f-01cd-490d-a392-42ae8ccc4ba3" />


