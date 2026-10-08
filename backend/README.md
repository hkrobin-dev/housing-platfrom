# Housing & Roommate Management Platform — Backend

A complete backend for a housing/roommate marketplace: property & room listings, roommate matching, viewing requests, applications → lease workflow, rent tracking, utility bill splitting, maintenance requests, documents, notifications, plan subscriptions, and real payment processing via SSLCommerz.

## Tech Stack

Node.js · TypeScript · Express.js · PostgreSQL · Prisma · Zod · JWT + Google OAuth · Multer + Cloudinary · SSLCommerz · Resend (email, optional) · Redis cache (optional) · Google Gemini (AI assistant) · ESLint/Prettier

## Setup

```bash
npm install
cp .env.example .env        # fill in real DATABASE_URL, JWT secrets, Cloudinary, SSLCommerz, Google OAuth creds
npx prisma generate
npx prisma migrate dev --name init
npm run seed                 # creates the demo admin account (see below)
npm run dev                  # http://localhost:5000
```

> **Already set up before?** The schema gained two new `User` fields
> (`resetPasswordToken`, `resetPasswordExpires`) for the password-reset feature. If
> you'd already run a migration, just run one more:
> `npx prisma migrate dev --name add_password_reset`

## Demo Credentials (one-click Demo Login on the frontend)

After running `npm run seed`, these three accounts exist (or set `ADMIN_EMAIL` /
`ADMIN_PASSWORD` in `.env` to override the admin):

```
ADMIN:  admin@housing.com  / Admin@12345   (or your ADMIN_EMAIL / ADMIN_PASSWORD)
OWNER:  owner@housing.com  / Owner@12345   (Provider role — lists properties)
TENANT: tenant@housing.com / Tenant@12345  (User role — browses, applies, pays)
```

## Roles (RBAC)

| Role | Notes |
|---|---|
| `ADMIN` | Full platform access, user management, global dashboard |
| `OWNER` | Manages own properties/rooms, reviews applications, sets rent |
| `MANAGER` | Same property-scoped powers as an owner, assigned per-property |
| `TENANT` | Searches, applies, pays rent/bills, raises maintenance requests, has an optional roommate profile |

## Response Format (enforced everywhere via `utils/apiResponse.ts`)

```json
// success
{ "success": true, "message": "Operation successful", "data": {} }
// error
{ "success": false, "message": "Something went wrong", "errors": [] }
```

## Modules & Endpoints

See `postman_collection.json` for the full, importable collection with example bodies. Summary:

```
/api/v1/auth                    register, login, google, refresh, logout, me, forgot/reset-password, verify-email
/api/v1/users                   profile, admin list, ban/verify/role
/api/v1/properties               CRUD + image upload + /my + /:id/tenants + /:id/manager assign/remove
/api/v1/properties/:id/rooms     nested room list/create
/api/v1/rooms                    room get/update/delete, reserve/release seat
/api/v1/roommates                profile, roommate matches, room matches
/api/v1/viewing-requests         create, my, property list, status update
/api/v1/applications             apply, my, property list, review→approve (creates Lease)
/api/v1/leases                   my, get, property list, terminate
/api/v1/rent-payments            generate schedule, list, pay (SSLCommerz)
/api/v1/utility-bills            create+split, property list, my splits, pay split
/api/v1/maintenance              create, my, property list, status update
/api/v1/documents                upload, my, get, delete
/api/v1/notifications            list, mark read
/api/v1/payments                 my payments, SSLCommerz success/fail/cancel/IPN callbacks
/api/v1/dashboard                owner stats, admin stats
/api/v1/assistant                AI chat (Google Gemini, needs GEMINI_API_KEY)
```

## Recently Closed Gaps

- **Notifications now fire automatically**: application approve/reject, viewing request
  status change, maintenance status change, payment confirmation, and lease termination
  all call `createNotification` — the Notifications page is no longer always empty.
- **`GET /properties/my`**: owner/manager-scoped property list (previously the frontend
  was misusing the public list endpoint).
- **`GET /leases/property/:propertyId`**: owners can now see leases tied to their
  property and trigger rent-schedule generation / termination from the UI.
- **`GET /properties/:id/tenants`**: returns active tenants (from active leases) for a
  property — used by the utility-bill split form instead of manually typing tenant UUIDs.
- **Admin user management**: `PATCH /users/:id/ban`, `/verify`, `/role` — admin can now
  ban/unban, manually verify, and change a user's role from the dashboard.
- **Rate limiting**: a strict limiter (8 req/15min) on `/auth/register` and `/auth/login`,
  a looser one (20 req/15min) on refresh/google, and a generous global limiter (300
  req/15min) on everything else. In-memory, no Redis required.
- **Manager assignment**: `PATCH /properties/:id/manager` (by email — auto-promotes a
  TENANT to MANAGER) and `DELETE /properties/:id/manager` to unassign.
- **Document delete**: `DELETE /documents/:id`, and uploads can now be linked to a
  specific lease via `leaseId` (surfaced in the frontend upload form).
- **Transactional email (Resend)**: welcome email on registration, payment confirmation
  email on successful SSLCommerz payment. Gracefully no-ops with a console warning if
  `RESEND_API_KEY` isn't set — never blocks the request that triggered it.
- **Forgot / reset password**: `POST /auth/forgot-password` and `/auth/reset-password`.
  Tokens are random, hashed before storage, expire in 1 hour, and the forgot-password
  response is identical whether or not the email exists (no user enumeration).
- **Redis caching (optional)**: the public property search (`GET /properties`) is cached
  for 30s per query signature via `config/redis.ts`, with automatic invalidation on
  property create/update/delete. If `REDIS_URL` isn't set, every call transparently
  falls back to a direct DB query — caching is a pure optimization, never a hard
  dependency.

## Key Backend Design Decisions

### 1. Transaction-safe room/seat availability
`Availability.seatsLeft` is only ever changed through an **atomic conditional update**
(`updateMany` with a `seatsLeft: { gt: 0 }` guard) inside a Prisma `$transaction`. If two
tenants apply for the last seat at the same time, only one `updateMany` call actually
matches a row and decrements — the other gets `count === 0` and the whole transaction
throws `409 Conflict`. Implemented in:
- `room.service.ts` → `reserveSeat` / `releaseSeat`
- `application.service.ts` → `reviewApplication` (approval path)
- `lease.service.ts` → `terminateLease` (releases the seat back)

### 2. Application → Lease workflow
Approving an application is a single `$transaction` that: reserves the seat, marks the
application `APPROVED`, auto-rejects other pending applications for the same room, and
creates the `Lease` record — all-or-nothing.

### 3. Roommate matching
A simple, explainable weighted-scoring algorithm (not ML) — budget overlap, location
match, and lifestyle-tag overlap — used for both roommate-to-roommate and
roommate-to-room matching. Easy to explain in the video walkthrough and easy to extend.

### 4. Utility bill splitting
`createUtilityBillWithSplit` creates the bill and all `UtilityBillSplit` rows in one
transaction, splitting evenly with any rounding remainder absorbed by the first tenant
so shares always sum exactly to the total.

### 5. Payments (SSLCommerz)
`payment.service.ts` initiates a session and stores a `Payment` row with status
`INITIATED`. The **success callback always re-validates server-side** via SSLCommerz's
validation API (`val_id`) before marking anything `SUCCESS` — the client-side redirect
alone is never trusted. An IPN endpoint is also provided for server-to-server
confirmation, the more reliable production path.

### 6. Consistent response & error handling
Every controller is wrapped in `catchAsync`, which forwards errors to a single global
`errorHandler`. That handler understands `ApiError` (thrown deliberately) and common
Prisma error codes (`P2002` unique constraint, `P2025` not found), always replying in
the required `{ success, message, data|errors }` shape.

## Database

Full schema in `prisma/schema.prisma`: 15 models, all relations, `@@unique` and
`@@index` constraints (e.g. duplicate-application prevention, one rent record per
lease per month, unique property+roomNo). PostgreSQL via Prisma, transactions used
wherever multiple writes must succeed or fail together.

## Deployment (Render)

`render.yaml` is included — connect the repo in Render, it provisions a free Postgres
instance and the web service, and reads `DATABASE_URL` etc. from environment variables
you set in the Render dashboard (marked `sync: false` so secrets aren't committed).
Build: `prisma generate && tsc`. Start: `prisma migrate deploy && npm start` (`node dist/src/server.js`).

## Assignment Requirement Checklist

| # | Requirement | Status |
|---|---|---|
| 1 | API Docs | ✅ `postman_collection.json` — import into Postman |
| 2 | Consistent Response | ✅ `utils/apiResponse.ts` + global error handler |
| 3 | 20+ commits | ⏳ your job — see suggested sequence below |
| 4 | Zod validation | ✅ every module has a `*.validation.ts` |
| 5 | Auth + RBAC (3+ roles) | ✅ ADMIN / OWNER+MANAGER / TENANT via `authenticate` + `authorize()` |
| 6 | Admin credentials | ✅ `npm run seed`, configurable via `.env` |
| 7 | Real payment | ✅ SSLCommerz sandbox integration, real validation flow |
| 8 | PostgreSQL + Prisma | ✅ full relational schema, `$transaction`, indexes, constraints |
| 9 | Deployment | ✅ `render.yaml` — connect repo & set env vars |
| 10 | Video walkthrough | ⏳ record after you've deployed and tested the flows |

## Suggested Commit Sequence (20+ commits)

```
feat: initialize project with typescript, express, prisma config
feat: add full prisma schema with all entities and relations
feat: add global api response and error handling utilities
feat: add zod validation middleware
feat: implement auth service (register, login, refresh, logout)
feat: add google oauth login
feat: add jwt authenticate and role-based authorize middleware
feat: add user module with rbac-protected admin endpoint
feat: add cloudinary and multer config for file uploads
feat: implement property module with crud and image upload
feat: implement room module with transaction-safe seat reservation
feat: implement roommate profile and weighted matching algorithm
feat: implement viewing request workflow
feat: implement application module with transaction-safe approval
feat: implement lease module with seat release on termination
feat: add sslcommerz payment gateway integration
feat: implement rent schedule generation and payment
feat: implement utility bill creation with atomic split
feat: implement maintenance request module
feat: implement document upload module
feat: implement notification module
feat: implement owner and admin dashboard stats
chore: add demo admin seed script
docs: add postman collection covering all endpoints
chore: add render deployment config
docs: add complete README
```

## Next Steps For You

1. `git init`, commit in the sequence above (split each `feat:` into a couple of
   smaller real commits as you touch each file — that easily clears 20+).
2. Set up a real PostgreSQL instance (Render/Neon/Supabase) and run migrations.
3. Get sandbox credentials for Google OAuth, Cloudinary, and SSLCommerz.
4. Deploy to Render using `render.yaml`.
5. Test the full flow end-to-end in Postman: register → create property → create room
   → apply → approve (watch the Lease get created) → generate rent schedule → pay →
   raise maintenance → upload document.
6. Record your 5–10 min walkthrough video.
