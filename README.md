# MyAdminCaptiva

<img width="2880" height="1800" alt="image" src="https://github.com/user-attachments/assets/1c17febf-18bd-492a-be39-12baa5aba7c2" />

## Made with Firebase Studio

This is a NextJS starter in Firebase Studio.
To get started, take a look at src/app/page.tsx.

## Docker setup

Run the following command

```bash
docker-compose down && docker-compose build --no-cache && docker-compose up
```

### CouchDB setup

Refer to [this README](./DATABASE.md)

## Authentication (JWT)

- The admin UI requires login at `/login` using the credentials from env vars `MYADMINCAPTIVA_USER` and `MYADMINCAPTIVA_PASS`.
- API routes are protected using a stateless HS256 JWT. Set `AUTH_JWT_SECRET` to a long random string in your `.env` or compose environment.
- The client stores the token in `localStorage` with a 1 hour expiry and sends it via `Authorization: Bearer <token>` on API requests.

Environment variables:

```
MYADMINCAPTIVA_USER=adminadmin
MYADMINCAPTIVA_PASS=passwordpassword
AUTH_JWT_SECRET=change_me_to_a_long_random_string
```

Security notes and OWASP alignment:

- Tokens include `exp`, are verified server-side, and are never logged.
- Using Authorization headers avoids CSRF; still validate inputs on server using zod.
- In this serverless/Docker UI, tokens are in `localStorage`. For stronger protection, switch to `HttpOnly` Secure cookies with SameSite=strict and add refresh token rotation when a backend is available.
