# Auth Starter — Vue/Nuxt + Node/Express + MongoDB

A working login + signup flow:

- **backend/** — Express API, MongoDB (Mongoose), bcrypt password hashing, JWT access tokens + httpOnly-cookie refresh tokens, rate-limited login, input validation.
- **frontend/** — Nuxt 3, Pinia store for auth state, route middleware that guards protected pages, a `/login` and `/signup` page, and a sample protected `/dashboard`.

## How auth works here

- On signup/login, the API returns a short-lived **access token** (15 min) in the JSON response, kept in memory in the Pinia store (not localStorage, to reduce XSS token-theft risk).
- A long-lived **refresh token** (7 days) is set as an `httpOnly`, `sameSite=strict` cookie, scoped to `/api/auth`. JS on the frontend never touches it directly.
- Refresh tokens are stored **hashed** in MongoDB and rotated on every use (old one invalidated, new one issued), so a stolen refresh token has a short window of use.
- When an access token expires mid-session, `composables/useApi.ts` transparently calls `/api/auth/refresh` once and retries the original request.
- `/dashboard` is protected by `middleware/auth.ts`, which tries to silently restore a session from the refresh cookie on page reload before redirecting to `/login`.

## Backend setup

```bash
cd backend
cp .env.example .env      # then edit JWT secrets + MONGO_URI
npm install
npm run dev                # nodemon, http://localhost:4000
```

Generate strong secrets with:
```bash
openssl rand -hex 64
```

You need a MongoDB instance running (local `mongod`, Docker, or Atlas) and its connection string in `MONGO_URI`.

## Frontend setup

```bash
cd frontend
cp .env.example .env      # adjust NUXT_PUBLIC_API_BASE if needed
npm install
npm run dev                # http://localhost:3000
```

## Endpoints

| Method | Path              | Auth        | Description                          |
|--------|-------------------|-------------|---------------------------------------|
| POST   | /api/auth/signup  | —           | Create account, returns user + access token |
| POST   | /api/auth/login   | —           | Rate-limited (10/15min), returns user + access token |
| POST   | /api/auth/refresh | cookie      | Rotates refresh token, returns new access token |
| POST   | /api/auth/logout  | cookie      | Revokes the current refresh token     |
| GET    | /api/auth/me      | Bearer token| Returns the current user              |

## Before deploying

- Set `NODE_ENV=production` so refresh cookies get `secure: true` (HTTPS only).
- Lock `CLIENT_ORIGIN` down to your real frontend origin(s).
- Consider adding email verification and a password-reset flow — not included here.
- Consider moving rate limiting to a shared store (Redis) if you run multiple backend instances.
