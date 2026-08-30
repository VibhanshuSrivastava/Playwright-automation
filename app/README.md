# TaskFlow (frontend)

A small React + Vite app for managing projects: sign in, then create/edit/delete projects against the Express API in [`backend/`](backend/).

## Stack

- React 19 + Vite 8 + TypeScript
- Plain `fetch` calls in [`src/services/api.ts`](src/services/api.ts) — no data-fetching library, this app is intentionally small
- ESLint (flat config) with `typescript-eslint` and the React Hooks plugin

## Running locally

```bash
cp .env.example .env   # optional — only needed if the API isn't on localhost:3000
npm install
npm run dev:test        # starts this app AND backend/ together
```

Then open http://localhost:5173 and sign in with the demo credentials shown on the login screen (`admin@taskflow.com` / `Admin@123` — see [`backend/src/routes/auth.routes.ts`](backend/src/routes/auth.routes.ts)).

Other scripts:

- `npm run dev` — this app only (expects the backend already running separately)
- `npm run build` — production build (`tsc -b && vite build`)
- `npm run typecheck` — type-check without emitting
- `npm run lint` — ESLint

## Configuration

The API base URL is read from `VITE_API_BASE_URL` (see [`.env.example`](.env.example)), defaulting to `http://localhost:3000/api` for local development.

## Notes on the demo backend

`backend/` is an intentionally minimal Express API for this demo:

- Data is **in-memory** — it resets to two seed projects on every server restart.
- Auth is a single hardcoded demo user, no sessions/tokens/passwords are real.
- A `POST /api/test/reset` endpoint restores the seed data; it's used by the Playwright suite for deterministic tests and returns `403` when `NODE_ENV=production`.

None of this is meant to be production auth/persistence — see the root [README](../README.md) for the full picture, including the Playwright test suite in [`../playwright/`](../playwright/).
