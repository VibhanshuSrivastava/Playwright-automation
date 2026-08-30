# TaskFlow — Playwright test suite

End-to-end and API tests for the TaskFlow app ([`../app`](../app)), independent of the app's own dependencies (own `package.json`, own `tsconfig.json`).

## Architecture

```
src/
  actions/
    BaseActions.ts       UI action layer — every page object goes through this
    BaseApiActions.ts    API counterpart — every API client goes through this
  api/
    ProjectsApiClient.ts One method per test scenario (self-verifying, see below)
  pages/
    LoginPage.ts          Page Object Model
    ProjectsPage.ts
  fixtures/
    api-request.fixture.ts    `api` — an APIRequestContext bound to API_BASE_URL
    projects-api.fixture.ts   `projectsApi` — ProjectsApiClient built on `api`
    pages.fixture.ts          `loginPage` / `projectsPage`
    project.fixture.ts        `project` — creates a project via the API, deletes it after
    index.ts                  merges the above into one `test`/`expect` for specs to import
  config/
    env.ts        loads playwright/.env (dotenv), typed `env` export with defaults
    paths.ts      STORAGE_STATE_PATH for the auth setup project
    timeouts.ts   shared timeout constants
  support/
    constants.ts   DEMO_CREDENTIALS
    test-data.ts   buildProjectPayload() factory
tests/
  setup/auth.setup.ts        logs in once, saves storageState
  auth/login.spec.ts         login flows (no storageState — must start logged out)
  projects/projects.spec.ts  authenticated UI flows (uses storageState)
  api/projects.api.spec.ts   API-only tests (no browser)
```

### Why a `BaseActions` wrapper instead of calling Playwright directly

Every page object resolves elements through `getElement()` (or the `getElementByRole`/`getElementByLabel`/etc. convenience wrappers), never `page.locator()`/`page.getByRole()` directly. That's one seam for framework-wide behavior: retry policy, iframe handling, default timeouts, a future self-healing hook — all in one place instead of scattered across page objects.

Assertion mode is controlled per call:

| mode               | behavior                                                                                 |
| ------------------ | ---------------------------------------------------------------------------------------- |
| default (soft)     | failure is recorded (`assertNoSoftFailures()` throws at teardown), execution continues   |
| `hardAssert: true` | throws immediately                                                                       |
| `silent: true`     | swallowed entirely — for existence probes (`isVisible`) and "confirm it's absent" checks |

### Why assertions live inside page objects/API clients, not in specs

Every test reads as a sequence of intent, not Playwright mechanics:

```ts
// login.spec.ts
await loginPage.login(DEMO_CREDENTIALS.email, 'WrongPassword', 'Invalid email or password');
```

```ts
// projects.api.spec.ts
await projectsApi.expectUpdateNotFound(999999, { name: '...', description: '...', status: 'completed' });
```

`login()` fills the form, submits, and verifies the outcome — success by default, or a specific alert + "didn't navigate" when an `expectedAlertText` is passed. Each `ProjectsApiClient.expect*` method makes one request and asserts its status/body — the raw `list/get/create/update/delete` methods are still there underneath for cases (like fixture setup/teardown) that need the response without an opinion on what it should look like.

One consequence: `eslint-plugin-playwright`'s `expect-expect` rule (flags tests with no visible `expect()` call) is disabled in [`eslint.config.js`](eslint.config.js) — it can't see assertions hidden behind domain-specific method names, and every test here does assert, just not literally.

### Authentication: storage state, not a login step per test

`tests/setup/auth.setup.ts` runs first (`setup` project), logs in once, and saves `storageState` to `.auth/user.json` (gitignored). `projects.spec.ts` runs in the `chromium-authenticated` project, which loads that storage state — so authenticated tests start already logged in, with zero login overhead. `login.spec.ts` intentionally runs in the plain `chromium` project (no storage state), since those tests need to start logged out.

This only works because the app persists a `taskflow:isLoggedIn` flag to `localStorage` on login — Playwright's `storageState` captures cookies + localStorage/sessionStorage, so an app with no persisted session at all gives it nothing to restore.

### Deterministic data on a stateful backend

The demo backend ([`../app/backend`](../app/backend)) holds projects in memory, shared across every parallel test. Two things make that safe:

1. `chromium-authenticated` depends on `['setup', 'api']` in `playwright.config.ts` — the `api` project's tests (which mutate the same data) fully finish before UI tests run, instead of racing them.
2. `projects.spec.ts` calls `projectsApi.reset()` (hits `POST /api/test/reset`) in a `beforeEach`, and the whole describe block runs `mode: 'serial'` — since a reset from one test would otherwise wipe out data another parallel test just created.

### Visual regression

`BaseActions.expectScreenshot()` wraps `expect(page).toHaveScreenshot()`, with an optional `mask` for anything that legitimately varies between runs. Baselines live in `tests/**/*-snapshots/` and are tied to the OS/browser build they were captured on — see the root README's "Screenshot baselines" section for why CI runs in a pinned Docker image and how to regenerate them.

## Running

```bash
cp .env.example .env    # optional — has working defaults
npm install
npm test                 # headless, auto-starts the app's dev server
npm run test:headed      # same, with a visible browser
npm run test:ui          # Playwright's UI mode
npm run test:report      # open the last HTML report
npm run typecheck
npm run lint
```

Config (`.env`, all optional): `BASE_URL`, `API_BASE_URL`, `DEMO_EMAIL`, `DEMO_PASSWORD`.

## Projects (`playwright.config.ts`)

| project                  | purpose                                          |
| ------------------------ | ------------------------------------------------ |
| `setup`                  | logs in, saves storage state                     |
| `api`                    | API-only tests, no browser                       |
| `chromium`               | UI tests that must start logged out (auth flows) |
| `chromium-authenticated` | UI tests that start already authenticated        |
