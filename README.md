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
npx expo start
```

<!-- TODO: platform-specific notes (simulator vs device vs web) once the app is built -->

## Environment variables

Backend (`backend/.env`, see `backend/.env.example`):

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string, e.g. `postgresql://user:pass@host/db?sslmode=verify-full` |
| `PORT` | HTTP port, defaults to `3000` |
| `GOOGLE_CLIENT_ID` | Google OAuth **web** client ID; used as the expected `aud` when verifying ID tokens |
| `JWT_SECRET` | Secret for signing the app's own JWTs, minimum 32 characters |
| `ALLOW_DEV_LOGIN` | Enables `POST /api/auth/dev-login`; `true` for local development, `false` in production |

No secrets are committed. `.env` is gitignored; `.env.example` contains placeholders only.

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
  app/               screens, file-based routes
  src/               API client, auth context, shared components
```

The layering rule is one-directional: routes → services → db. SQL appears only under `db/`.

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

<!-- TODO: trim and finalise in the last pass -->

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

## Google Sign-In

<!-- TODO: finalise once the mobile login screen is built -->

The backend performs real server-side verification: the Google ID token's signature is checked
against Google's public keys, the audience is checked against `GOOGLE_CLIENT_ID`, and the email must
be verified. A client claim of identity is never trusted.

## What was completed

<!-- TODO: fill in during the final pass -->

## What was not completed

<!-- TODO: fill in during the final pass -->

## What I would do next

<!-- TODO: fill in during the final pass -->
