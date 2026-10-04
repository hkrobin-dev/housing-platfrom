# AGENTS.md — backend

Node 22 + Express 4 + TypeScript + Prisma 5 (PostgreSQL) REST API.
Base path `/api/v1`, health check `GET /`. Deploys to Render via `render.yaml`.

## Commands (run from `backend/`)

```bash
npm install
cp .env.example .env          # fill DATABASE_URL, JWT secrets, Cloudinary,
                              # SSLCommerz, Google OAuth, GEMINI_API_KEY
npx prisma generate
npx prisma migrate dev --name <name>
npm run seed                  # demo admin from ADMIN_EMAIL / ADMIN_PASSWORD
npm run dev                   # nodemon + ts-node src/server.ts → :5000
npm run build                 # tsc → dist/src/server.js (rootDir is ".")
npm start                     # node dist/src/server.js (+ migrate deploy on Render)
npm run lint                  # eslint src --ext .ts
npx prisma studio             # DB browser
```

## Module pattern (16 modules in `src/modules/`)

Every module follows `*.route.ts → *.controller.ts → *.service.ts →
*.validation.ts`:

- `route`: `authenticate`, `authorize(...roles)`, `validate(schema)`, route-specific
  rate limiter. Mounted in `src/app.ts` — register new routers there.
- `controller`: wrap every handler in `catchAsync`; reply only via
  `sendSuccess(res, { message, data })` from `utils/apiResponse.ts`.
- `service`: all Prisma access lives here. Throw `ApiError(status, message)`
  for expected failures — `middlewares/errorHandler.ts` maps them plus Prisma
  `P2002`/`P2025` into the `{ success, message, data|errors }` envelope.
- `validation`: Zod schemas, enforced by `middlewares/validate.ts`.
- Exceptions to the pattern (no `*.validation.ts`): `document`, `notification`,
  `payment`, `dashboard`. `user` has no `user.service.ts`. Match surrounding
  style when extending these.

## Invariants — do not break

1. **Response envelope**: all success/error output goes through
   `utils/apiResponse.ts` + the global `errorHandler` (`app.ts` wires
   `notFoundHandler` then `errorHandler` last). Never `res.json` ad-hoc shapes.
2. **Transaction-safe seats**: `Availability.seatsLeft` changes ONLY via atomic
   `updateMany({ where: { seatsLeft: { gt: 0 } } })` inside a `$transaction`
   (`room.service.ts → reserveSeat/releaseSeat`; used by
   `application.service.ts → reviewApplication` and `lease.service.ts →
   terminateLease`). Approving an application = reserve seat + mark APPROVED +
   auto-reject other pendings for the room + create `Lease`, all-or-nothing.
3. **RBAC**: `ADMIN` full access; `OWNER` own properties; `MANAGER`
   property-scoped (assigned by owner email via `PATCH /properties/:id/manager`,
   auto-promotes `TENANT`); `TENANT` search/apply/pay. Check ownership/manager
   scope in the service, not just the route.
4. **Payments**: SSLCommerz `Payment` rows start `INITIATED`; the success callback
   must re-validate server-side via `val_id` before marking `SUCCESS` — never
   trust the client redirect. IPN is the production source of truth.
5. **Side effects degrade gracefully**: Resend emails (welcome, payment receipt),
   Redis 30 s property-search cache (`config/redis.ts`), Cloudinary uploads —
   each no-ops/falls back with a warning when its env key is unset. Keep that
   property when touching these paths.
6. **Anti-enumeration**: `forgot-password` returns an identical response whether
   or not the email exists; reset tokens are stored hashed, expire in 1 h.

## Conventions

- ES2020 / CommonJS, `strict: true`, path alias `@/* → src/*` (`tsconfig.json`).
- Rate limits: global 300/15 min (`app.ts`); strict 8/15 min on
  register/login, 20/15 min on refresh/google (`rateLimit.middleware.ts`).
- `prisma/schema.prisma` (15 models, 19 enums): add `@@unique`/`@@index` for new
  identity/lookup constraints; Decimal for money; `String[]` for tags/amenities.
  Every schema change needs a migration + `prisma generate`.
- `postman_collection.json` is the API docs — update it when endpoints change.
- `render.yaml` env vars are all `sync: false` secrets set in the Render
  dashboard; add new required keys there too (currently covers JWT, Google,
  Cloudinary, SSLCommerz, ADMIN_*, CLIENT_URL, plus optional RESEND/REDIS/
  EMAIL_FROM/REDIS/GEMINI keys).
