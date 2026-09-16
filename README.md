# HR System

An internal HR system for managing company employees: a React Native (Expo) mobile app backed by a
Node/Express API over PostgreSQL.

## Technologies

**Backend**
- Node.js 24 + Express 5, TypeScript
- PostgreSQL (hosted on Neon), raw SQL via `pg` — no ORM
- Zod for validation
- `google-auth-library` to verify Google ID tokens, `jsonwebtoken` for the app's own session tokens

**Mobile**
- React Native via Expo, TypeScript
- Expo Router for file-based navigation
- `expo-secure-store` for token storage

No build step on the backend: Node 24 strips TypeScript types natively, so `src/server.ts` runs
directly. `tsc` is used for type checking only.

## Running the project

### 1. Database

Any PostgreSQL 14+ database works; this was developed against Neon. The `pg_trgm` extension is
required (the schema migration creates it) and is available on Neon by default.

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env    # then fill in the values
npm run migrate
npm run dev
```

The server listens on `http://localhost:3000`. `GET /health` performs a real query against the
database and returns `{"ok":true}`.

### 3. Mobile

```bash
cd mobile
npm install
cp .env.example .env    # then fill in the values
npx expo start
```

Press `i` for the iOS Simulator (the primary target) or `w` for web.

The backend must be running first. `EXPO_PUBLIC_API_BASE_URL` defaults to `http://localhost:3000`,
which works on the iOS Simulator and on web. On a **physical device via Expo Go**, `localhost` is the
phone, so set that variable to your machine's LAN address (e.g. `http://192.168.1.20:3000`).

## Environment variables

Backend (`backend/.env`, see `backend/.env.example`):

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string, e.g. `postgresql://user:pass@host/db?sslmode=verify-full` |
| `PORT` | HTTP port, defaults to `3000` |
| `GOOGLE_CLIENT_ID` | Google OAuth **web** client ID; used as the expected `aud` when verifying ID tokens |
| `JWT_SECRET` | Secret for signing the app's own JWTs, minimum 32 characters |
| `ALLOW_DEV_LOGIN` | Enables `POST /api/auth/dev-login`; `true` for local development, `false` in production |

Mobile (`mobile/.env`, see `mobile/.env.example`):

| Variable | Purpose |
| --- | --- |
| `EXPO_PUBLIC_API_BASE_URL` | Backend base URL, defaults to `http://localhost:3000` |
| `EXPO_PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth web client ID. Public by design — an OAuth client ID is not a secret |

No secrets are committed. `.env` is gitignored in both packages; the `.env.example` files contain
placeholders only. The Google **client secret** is never used: ID-token verification is public-key,
so the backend needs only the client ID.

## System structure

```
backend/
  migrations/        forward-only .sql files, applied in filename order
  src/
    constants/       route paths, error codes, user-facing strings, enum vocabularies
    db/              all SQL; nothing else in the codebase talks to PostgreSQL
    services/        business rules, maps failures to HTTP status codes
    routes/          thin handlers: validate, call a service, send a response
    middleware/      JWT authentication
    schemas/         Zod schemas for request bodies, query strings and route params
    types/           shared response types
mobile/
  src/
    app/             expo-router routes — each file is a 3-line re-export of a screen
    screens/         one component per screen
    components/      shared UI (rows, form fields, pickers, loading/error/empty states)
    api/             fetch client and one module per resource
    context/         auth state and session persistence
    hooks/           useFetch, useDebouncedValue, useIsMounted, useRefreshOnFocus
    constants/       strings, theme, enum vocabularies, route and API paths
    types/           API response types and component prop types
```

The layering rule is one-directional: routes → services → db. SQL appears only under `db/`.
The mobile side mirrors it: route files hold no logic, exactly like the thin Express handlers.

### API

All routes except `/health` and `/api/auth/*` require `Authorization: Bearer <jwt>`.
Errors share one shape: `{ "error": { "code": string, "message": string } }`.

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/api/auth/google` | Verify a Google ID token, return an app JWT |
| `POST` | `/api/auth/dev-login` | Development-only login returning the same JWT shape |
| `GET` | `/api/departments` | List departments |
| `GET` | `/api/employees` | List employees — `search`, `departmentId`, `status`, `page`, `pageSize` |
| `GET` | `/api/employees/:id` | Employee detail |
| `POST` | `/api/employees` | Create an employee |
| `PUT` | `/api/employees/:id` | Update an employee |
| `GET` | `/api/employees/:id/timeline` | List timeline entries, newest event first |
| `POST` | `/api/employees/:id/timeline` | Add a timeline entry |

### Data model

Four entities: `departments`, `users` (people who sign in), `employees`, and `timeline_entries`.

- `users` and `employees` are **separate tables with no link between them**. The spec lists them as
  separate concerns, and an HR user does not have to appear in the employee roster.
- **Direct manager is a nullable self-referencing foreign key** on `employees`. A manager is another
  employee, not a user.
- `departments` is a real table, referenced by foreign key — never free text.
- Employment type, employment status and timeline event type are **native PostgreSQL enum types**.
  Adding a value is a migration, which is the intended cost.

Indexes, and why each exists:

| Index | Reason |
| --- | --- |
| `employees (department_id)` | Foreign key, and the department filter |
| `employees (manager_id)` | Foreign key, and "who reports to this person" |
| `employees (last_name, first_name)` | List ordering and stable pagination |
| `employees` GIN trigram on `lower(first_name \|\| ' ' \|\| last_name)` | Name search is `LIKE '%term%'`; a B-tree cannot serve a leading wildcard |
| `timeline_entries (employee_id, event_date DESC, id DESC)` | Exactly the timeline query's shape |
| `timeline_entries (author_user_id)` | Foreign key |

An index on `employment_status` was considered and rejected: three distinct values over a small
table is too low a selectivity for the planner to use it.

## Decisions and assumptions

- **The spec's "role" is stored as `job_title`**, to avoid collision with authorisation-role vocabulary.
- **Any valid Google account can sign in.** The spec explicitly excludes a permissions system. In a
  real deployment the first change would be a domain allowlist.
- **Salary is visible to every authenticated user** — a direct consequence of having no roles.
- **Salary is `numeric(12,2)` with no currency column**, assumed to be monthly gross.
- **`PUT`, not `PATCH`, for employee updates.** The edit form always submits the whole resource, so
  there is no partial-merge logic anywhere.
- **`/api/departments` is deliberately not paginated.** It is a small fixed lookup feeding a picker.
- **Timeline entries are ordered by `event_date`, not `created_at`.** When an event happened and when
  it was written down are different facts; both are stored.
- **The timeline entry's author is always taken from the JWT**, never from the request body.
- **Dates are returned as `YYYY-MM-DD` strings** formatted in SQL. Returned raw, a `date` column
  becomes a JS `Date` and shifts by a day when serialised in a non-UTC timezone.
- **Salary is cast to `float8` in SQL.** `pg` returns `numeric` as a string to protect precision;
  the cast keeps storage exact and transport numeric. A payroll system would keep the string.
- **Duplicate emails are detected by catching the unique violation**, not by a prior `SELECT`, which
  would race.
- **Migrations are plain `.sql` files with a ~30-line runner**, rather than a migration library —
  one less dependency, and every line is explainable. Forward-only, no down-migrations.
- **Employee and department existence are checked explicitly** before insert/update rather than
  decoding foreign-key constraint names from PostgreSQL errors.
- **Self-management is blocked** both by a `CHECK` constraint and a service-level 400. Longer
  reporting cycles (A → B → A) are **not** prevented.

### Mobile

- **Route files contain no logic.** Every file under `src/app/` re-exports a screen from
  `src/screens/`, mirroring the thin Express handlers on the backend.
- **No state-management, form or UI library.** One `useFetch` hook covers loading / error / abort
  across four screens. A form library was considered and rejected: of the form's ~250 lines only
  about 50 are state plumbing — the rest is JSX that no library removes — and two forms do not
  justify the dependency.
- **Pickers are built from `Pressable` pills** (types, statuses, departments) and a modal list for
  the manager, rather than adding a picker dependency.
- **Enum vocabularies are duplicated** in `mobile/src/constants/employment.ts`. The backend derives
  them from Zod, but mobile is a separate package and cannot import across. The alternatives were a
  shared workspace package (real monorepo tooling for a four-hour exercise) or serving the
  vocabularies from an endpoint. Duplication was the cheapest honest option; the server remains the
  authority, since an unknown value is rejected by the enum column.
- **`typedRoutes` is enabled** and route constants carry explicit literal type annotations, so a
  mistyped route is a compile error while the strings stay centralised.
- **Screens refetch on focus** (`useRefreshOnFocus`) so the list and profile are never stale after a
  save. Refetches are silent when data is already on screen — the spinner appears on first load
  only, which avoids a flicker on every back-navigation. Cost: returning to the list resets it to
  page 1, losing scroll position. A dirty-flag store would fix that and was judged not worth it.
- **Creating an employee navigates to the new profile**, not back to the list. The list is sorted
  alphabetically by surname, so a new employee often lands on page 2 or 3 and would appear to have
  vanished.
- **Employee list ordering is `last_name, first_name, id`.** The `id` tiebreaker makes pagination
  deterministic — without it, offset paging can repeat or skip rows.
- **Known wrinkle:** changing the search term while past page 1 issues one request with the stale
  page number before the page resets. It is aborted immediately, so the result is correct; removing
  it entirely would need a reducer or request-id guard.

## Google Sign-In

The backend performs real server-side verification: the Google ID token's signature is checked
against Google's public keys, the audience is checked against `GOOGLE_CLIENT_ID`, and the email must
be verified. A client claim of identity is never trusted. `POST /api/auth/google` returns `401` for
any token that fails these checks.

### Known blocker: Google Sign-In does not complete in Expo Go

Signing in with Google from the iOS Simulator fails with `Error 400: invalid_request` — *"this app
doesn't comply with Google's OAuth 2.0 policy for keeping apps secure."*

**Cause.** Google accepts custom-scheme redirect URIs (`hrsystem://…`, `exp://…`) only for OAuth
clients of type **iOS** or **Android**. This project has a **Web** client, which accepts `http(s)`
redirect URIs only. Expo Go cannot register a native custom scheme with Google, so the native
handshake is rejected before the app is ever reached.

**What this does and does not affect.** It is purely a client-side OAuth configuration limit. The
server-side verification described above is implemented and tested; nothing in the API is stubbed.

**The fix, with more time.** Create iOS and Android OAuth clients in Google Cloud Console, then move
off Expo Go to a development build (`npx expo run:ios`, or EAS Build) so the app owns a real bundle
identifier and custom scheme. That is a build-infrastructure task rather than an application-code
one, which is why it was out of scope for the time budget.

**Workaround used.** `POST /api/auth/dev-login` accepts an email and issues **the same JWT** the
Google path issues — same signing key, same claims, same expiry. Auth middleware, every protected
endpoint, and timeline author attribution behave identically no matter which endpoint minted the
token; only the Google handshake is bypassed. It is gated by `ALLOW_DEV_LOGIN` and returns `404`
when disabled, so it does not exist in a production deployment.

## What was completed

The full core flow works end to end.

**Backend** — all required endpoints, each exercised manually against the live database:
list employees (trigram search, department and status filters, pagination), get employee, create,
update, get departments, get timeline, add timeline entry. Google ID-token verification, JWT
issuance and auth middleware. Zod validation on every body, query string and route param, with
parsed values reassigned so undeclared keys are stripped. One centralised error handler and one
error shape. Five forward-only migrations including a 25-row seed.

**Mobile** — Login (Google plus the documented dev fallback), Employees list with debounced search,
infinite scroll and pull-to-refresh, Employee profile, Create employee, Edit employee, Employee
timeline, and Add timeline entry. Loading, error and empty states on every screen; every fetch is
abortable and cleaned up on unmount; submit buttons disable while saving.

## What was not completed

- **Google Sign-In does not complete in Expo Go.** Server-side verification is implemented and
  tested; the client handshake is blocked by OAuth client-type configuration. See the section above.
- **No automated tests.** Explicitly out of scope per the brief, and the wrong use of the remaining
  time against a working flow. Endpoints were verified manually; the service layer is the natural
  first target for unit tests.
- **No bonus features** — department/status filters (the API supports them, the UI does not),
  employee photo, dashboard, delete/deactivate, audit log.
- **Dates are validated text inputs (`YYYY-MM-DD`)**, not native date pickers. A picker is one more
  dependency plus iOS/Android divergence, and it was scheduled behind core functionality.

## What I would do next

1. **A development build with iOS and Android OAuth clients**, to finish Google Sign-In on device.
2. **Tests** — service-layer unit tests around the 404/409 mapping, and one end-to-end test through
   the employee create/read path.
3. **Restrict sign-in to a company domain**, and add roles so salary is not visible to everyone.
   Both are deliberate omissions the brief permits, and both are the first things a real deployment
   would need.
4. **Department and status filters in the UI** — the API and indexes already support them.
5. **Cursor pagination** if the roster grew; offset paging is correct here but drifts under
   concurrent writes.
6. **Share the enum vocabularies** between backend and mobile via a workspace package, removing the
   one piece of duplication in the codebase.
