# TaskFlow

A small full-stack project management demo (React + Express) built specifically to carry a **complete, production-style Playwright test suite** — Page Object Model, a typed API client, storage-state auth, visual regression, a custom action-layer wrapper with soft/hard/silent assertion modes, and a CI pipeline pinned to a reproducible browser environment.

<!--
Once this is pushed to GitHub, uncomment and fill in to show a live CI badge:
[![Playwright Tests](https://github.com/<you>/<repo>/actions/workflows/playwright.yml/badge.svg)](https://github.com/<you>/<repo>/actions/workflows/playwright.yml)
-->

This is an npm workspaces monorepo with the app and its test suite kept fully separate:

- [`app/`](app/) — the React + Vite frontend ([`app/src`](app/src)) and the Express backend ([`app/backend`](app/backend))
- [`playwright/`](playwright/) — the test suite, with its own dependencies, README, and CI job. **Start here:** [`playwright/README.md`](playwright/README.md) for the framework architecture.

## Getting started

```bash
npm install                                   # installs all workspaces
cp playwright/.env.example playwright/.env    # optional — has working defaults
cp app/.env.example app/.env                  # optional — has working defaults
npm run dev:test                              # starts backend + frontend together (for running tests against)
npm test                                      # runs the Playwright suite (auto-starts the frontend dev server)
```

Other useful scripts (run from the repo root):

| Script                            | Does                                                   |
| --------------------------------- | ------------------------------------------------------ |
| `npm run dev`                     | frontend dev server only                               |
| `npm run dev:backend`             | backend dev server only                                |
| `npm run build`                   | build the frontend                                     |
| `npm run lint`                    | lint the frontend + the Playwright suite               |
| `npm run typecheck`               | type-check the frontend, backend, and Playwright suite |
| `npm run format` / `format:check` | Prettier, across the whole repo                        |
| `npm run test:headed`             | Playwright suite with browsers visible                 |
| `npm run test:headless`           | Playwright suite headless (same as `npm test`)         |
| `npm run test:ui`                 | Playwright UI mode                                     |
| `npm run test:report`             | open the last Playwright HTML report                   |

See [`app/README.md`](app/README.md) for frontend/backend-specific notes (including why the demo backend is intentionally in-memory) and [`playwright/README.md`](playwright/README.md) for the test framework's design.

### Git hooks

`npm install` sets up Husky automatically (`prepare` script). It runs `format:check` + `lint` on `pre-commit`, and `typecheck` on `pre-push` — the same checks CI's `verify` job runs, just closer to the point of writing the code.

## CI

[`.github/workflows/playwright.yml`](.github/workflows/playwright.yml) runs on every push/PR, plus a manual `update-screenshots` job for regenerating visual-regression baselines. Both run inside `mcr.microsoft.com/playwright:v1.62.1-jammy` — a pinned OS/browser image, not just `ubuntu-latest` — because the screenshot baselines below need a fixed target to compare against.

### Screenshot baselines

Some Playwright tests are visual-regression checks (`expectScreenshot`/`expectPageScreenshot` — see [`playwright/README.md`](playwright/README.md)). Their baseline PNGs live under `playwright/tests/**/*-snapshots/` and are tied to the OS/browser build they were captured on (filenames encode the platform, e.g. `-win32.png` vs `-linux.png`) — locally-generated baselines from a different OS will not match what CI compares against.

To (re)generate CI-matching baselines:

- With Docker: `docker run --rm -v "$PWD:/work" -w /work mcr.microsoft.com/playwright:v1.62.1-jammy sh -c "npm ci && npm --prefix playwright run test -- --update-snapshots"` (make sure the app/backend dev server is reachable, or run it separately and point `BASE_URL`/`API_BASE_URL` at it).
- Without Docker: trigger the **update-screenshots** workflow manually from the Actions tab, then download its `updated-snapshots` artifact and commit the changed files — it uploads new baselines but never commits them itself.

## License

[MIT](LICENSE)
