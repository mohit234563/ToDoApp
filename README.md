# To-do list: full stack

A day-by-day to-do app. Spring Boot + MongoDB backend (your TODoList code, with fixes), React frontend.

```
backend/    Spring Boot 4, Java 21, MongoDB, JWT   (port 3007)
frontend/   React 19, Vite, Tailwind 4             (dev server on port 5173)
.env.example, docker-compose.yml, .gitignore
```

## Run it (development)

You need Java 21, Node 20+, and a MongoDB (Docker or Atlas).

1. **Config.** Copy `.env.example` to `.env` in this folder and set `JWT_SECRET`
   (at least 32 characters: `openssl rand -base64 48`). The backend refuses to start without it.
2. **MongoDB.** `docker compose up -d`, or put your Atlas connection string in `MONGO_URI`.
3. **Backend.** `cd backend && ./mvnw spring-boot:run` (Windows: `mvnw.cmd spring-boot:run`).
4. **Frontend.** `cd frontend && npm install && npm run dev`, then open http://localhost:5173.
   The dev server forwards `/api/*` to the backend, so no CORS setup is needed.

## Run it as one app (a single jar)

```
cd frontend && npm install && npm run build:spring   # builds and copies into backend/src/main/resources/static
cd ../backend && ./mvnw package
java -jar target/*.jar                               # everything on http://localhost:3007
```

If the frontend is hosted somewhere else instead, build it with `VITE_API_BASE=https://your-api npm run build`
and list its address in `CORS_ALLOWED_ORIGINS`.

## What changed in the backend

| Change | Why |
| --- | --- |
| `Todo.getIdHex()` | `ObjectId` serialised as an object the browser can't use as an id |
| Password is write-only on `User` | the hash was being returned by `/User/get-user` |
| Expired/bad token gives 401 | it used to throw a 500 inside the filter |
| Ownership check on edit, delete, mark | any logged-in user could change anyone's task by id |
| `markTodo` is now `POST` | a GET that changes data is unsafe |
| `addTodo` takes `?date=`; broken `/addTodo/{date}` removed | the old route couldn't work |
| Blank text and past dates rejected (400); not found is 404 | clear errors instead of 500s |
| Register: 400 for blank, 409 for a taken name | the UI can say what went wrong |
| `GET /User/get-All-users` removed | it listed every user to any logged-in user |
| `JWT_SECRET` must be set (32+ chars) | no weak default |
| `/login`, `/signup`, `/account`, `/day/..` forward to `index.html` | single-jar mode |

The tokens still last 5 minutes with no refresh. The app handles that by asking for the password
again in a small dialog, without losing what you were typing.

## API

Public: `POST /public/register-user`, `POST /public/login` (returns the token as plain text).
Send `Authorization: Bearer <token>` to the rest:
`GET /User/get-user`, `PUT /User/editUser`, `GET /todos/getAllTodo`,
`GET /todos/get-userTodo-byDate/{yyyy-MM-dd}`, `POST /todos/addTodo?date=`,
`PUT /todos/editTodo/{id}` (body is the new text as `text/plain`),
`POST /todos/markTodo/{id}`, `DELETE /todos/deleteTodo/{id}`.

## Before you push to GitHub

- The `.env` and the Atlas password / JWT secret that were in the original repo are exposed in its history:
  change the Atlas password and use a new JWT secret.
- Delete the old `bin/` folder from the repo (`git rm -r --cached bin`). The `.gitignore` here covers it.

## Honest note on testing

The frontend was tested end to end in a browser (23 steps, in both dev mode and single-origin mode)
against a stand-in server that follows the API above. The Java changes could not be compiled or run in
the environment this was built in (no access to Maven Central or MongoDB), so they were only syntax-checked.
Run `./mvnw spring-boot:run` once and tell me about any compile error; they should be small.
