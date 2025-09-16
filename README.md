# MyAdminCaptiva

<img width="2880" height="1800" alt="image" src="https://github.com/user-attachments/assets/1c17febf-18bd-492a-be39-12baa5aba7c2" />

## Made with Firebase Studio

This is a NextJS starter in Firebase Studio.
To get started, take a look at src/app/page.tsx.

## Getting Started

Prerequisites:

- Node.js 18+ and npm
- Docker (for local CouchDB)

1) Install dependencies

```bash
npm install
```

2) Configure environment

Create `.env` from `.env.example` and set auth + storage variables. Minimum needed for login:

```
MYADMINCAPTIVA_USER=adminadmin
MYADMINCAPTIVA_PASS=passwordpassword
AUTH_JWT_SECRET=change_me_to_a_long_random_string
```

3) Start local DB (CouchDB) with Docker

```bash
docker-compose up -d
```

See [DATABASE.md](./DATABASE.md) for DB details.

4) Run the app

```bash
npm run dev
```

Open http://localhost:9002 and sign in at `/login` with `MYADMINCAPTIVA_USER` / `MYADMINCAPTIVA_PASS`.

## REST Authentication

The app exposes a REST login endpoint that returns a JWT for use with API calls.

- Endpoint: `POST /api/auth/login`
- Body: `{ "username": string, "password": string }`
- Response: `{ "token": string, "expiresIn": number }`

Example:

```bash
curl -sS http://localhost:9002/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"'$MYADMINCAPTIVA_USER'","password":"'$MYADMINCAPTIVA_PASS'"}'
```

Use the returned token in the `Authorization` header for protected routes:

```
Authorization: Bearer <token>
```

## REST API (Users)

- List users (no auth required):

```bash
curl -sS http://localhost:9002/api/users | jq
```

- Create user (requires Bearer token):

```bash
TOKEN="$(curl -sS http://localhost:9002/api/auth/login -H 'Content-Type: application/json' \
  -d '{"username":"'$MYADMINCAPTIVA_USER'","password":"'$MYADMINCAPTIVA_PASS'"}' | jq -r .token)"

curl -sS http://localhost:9002/api/users \
  -H 'Authorization: Bearer '$TOKEN \
  -H 'Content-Type: application/json' \
  -d '{
    "username": "guest_user01",
    "password": "S3cur3Pa$$",
    "macAddress": "00:1A:2B:3C:4D:5E",
    "uploadLimitBites": 0,
    "downloadLimitBites": 0
  }' | jq
```

- Update user (requires Bearer token):

```bash
curl -sS -X PATCH http://localhost:9002/api/users/<id> \
  -H 'Authorization: Bearer '$TOKEN \
  -H 'Content-Type: application/json' \
  -d '{
    "username": "guest_user01",
    "password": "NewPa55word!",
    "macAddress": "00:1A:2B:3C:4D:5E",
    "uploadLimitBites": 1048576,
    "downloadLimitBites": 1048576
  }' | jq
```

- Delete user (requires Bearer token):

```bash
curl -sS -X DELETE http://localhost:9002/api/users/<id> \
  -H 'Authorization: Bearer '$TOKEN | jq
```

## Docker setup

Run the following to rebuild and start all services:

```bash
docker-compose down && docker-compose build --no-cache && docker-compose up
```

## Authentication (JWT) Notes

- The admin UI requires login at `/login` using the credentials from env vars `MYADMINCAPTIVA_USER` and `MYADMINCAPTIVA_PASS`.
- API routes are protected using a stateless HS256 JWT. Set `AUTH_JWT_SECRET` to a long random string in your `.env` or compose environment.
- The client stores the token in `localStorage` with a 1 hour expiry and sends it via `Authorization: Bearer <token>` on API requests.

Security considerations:

- Tokens include `exp`, are verified server-side, and are never logged.
- Using Authorization headers avoids CSRF; still validate inputs on server using zod.
- In this serverless/Docker UI, tokens are in `localStorage`. For stronger protection, consider `HttpOnly` Secure cookies with SameSite=strict and refresh-token rotation when a backend is available.
