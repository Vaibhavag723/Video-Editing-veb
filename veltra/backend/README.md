# Veltra — backend architecture blueprint

NestJS + Prisma + PostgreSQL service layer for the Veltra full-stack app.

> **Status:** architecture/blueprint. This folder contains the complete module
> structure, Prisma schema, guards, DTOs and wiring — intended to be run under
> NestJS 10+ with `npm install && npx prisma migrate dev && npm run start:dev`.

## Modules

| Module | Responsibility |
| --- | --- |
| `auth` | Register / login / refresh, JWT strategy, Google OAuth, password hashing (bcrypt + Argon2id) |
| `users` | CRUD, role management, admin-only endpoints |
| `projects` | Project documents, timeline JSON, ownership & sharing |
| `media` | Upload presigned URLs, asset metadata, object-storage abstraction |
| `exports` | Render jobs, status, download URLs, webhooks from the render service |
| `subscriptions` | Plans, checkout, Stripe webhooks, entitlements/quotas |
| `platform` | Public pages, blog posts, support questions, login audit |
| `admin` | Aggregates the above into dashboard stats (guarded by `RolesGuard`) |

## Security model

- **JWT** access tokens (15 min) + rotating refresh tokens stored hashed (`Session`).
- **Role-based access control** — `USER | EDITOR | ADMIN` via `@Roles()` +
  `RolesGuard` (decorator & guard in `src/common`).
- **Passwords** hashed with **Argon2id** (fallback bcrypt) — never plain text.
- **Logins** recorded to `LoginEvent` (success/failure, IP, user-agent) for the
  admin “Logins” console, with rate-limiting on auth routes.
- **Quotas** derived from the user's `Plan` entitlements before media upload/export.
- All scalar `Json` fields validated with `class-validator` DTOs in/out.

## Data model (Prisma)

`prisma/schema.prisma` — see:

- `User`, `Session`, `LoginEvent`, `RefreshToken`
- `Plan`, `Subscription`
- `Project` (timeline `Json`), `MediaAsset`, `Export`
- `Page`, `BlogPost`, `Question`, `Activity`

## Infrastructure

`docker-compose.yml` boots PostgreSQL 16 + pgAdmin locally.

## Docs

- `POST /api/auth/register` — full name, email, password (strength enforced)
- `POST /api/auth/login` — returns `{ accessToken, refreshToken, user }`
- `POST /api/auth/google` — exchanges the Google ID token
- `GET /api/admin/stats` — totals + growth + health (ADMIN only)
- `GET|POST /api/projects`, `/api/projects/:id/export` — project & export flows
- `POST /api/media/presign` — presigned upload for S3/R2/GCS
- `POST /api/subscriptions/checkout` — Stripe checkout session

Run:

```bash
cd backend
npm install
cp .env.example .env
docker compose up -d          # postgres
npx prisma migrate dev --name init
npx prisma db seed
npm run start:dev             # http://localhost:4000/api
```