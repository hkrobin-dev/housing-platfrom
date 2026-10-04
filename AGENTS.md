# AGENTS.md — housing-platform-monorepo

Monorepo with two fully independent projects. There is no shared code, no
workspaces, no root build. Each folder has its own `package.json` and deploys
separately.

```
housing-platform-monorepo/
├── backend/    Express 4 + TypeScript + Prisma (Postgres) REST API  → Render
├── frontend/   Next.js 14 App Router + TypeScript + Tailwind UI     → Vercel
└── package.json  convenience scripts only (install:all, dev:*, build:*, prisma:*, seed)
```

## Working in this repo

- Scope every change to ONE project unless the task explicitly spans both.
  Backend and frontend each have their own `AGENTS.md` — read the one for the
  project you are touching before writing code.
- API contract: `POST /api/v1/assistant/chat` aside, every backend response uses
  the envelope `{ success, message, data | errors }`. The frontend's
  `lib/api.ts` + `lib/types.ts` (`ApiResponse<T>`) already assume this — do not
  introduce endpoints that break it.
- Auth is cookie-stored JWT (`accessToken` 1d / `refreshToken` 7d) with silent
  refresh in `frontend/lib/api.ts`. Backend RBAC roles: `ADMIN, OWNER, MANAGER,
  TENANT` via `authenticate` + `authorize()`.
- Base URLs: backend `http://localhost:5000` (routes under `/api/v1/*`),
  frontend `http://localhost:3000` via `NEXT_PUBLIC_API_URL`.

## Root commands (run from repo root)

```bash
npm run install:all    # install backend + frontend
npm run dev:backend     # http://localhost:5000
npm run dev:frontend    # http://localhost:3000
npm run prisma:generate / prisma:migrate / seed   # proxied to backend
```

## Env files (never commit secrets)

- Backend: `backend/.env.example` → `backend/.env` (DATABASE_URL, JWT secrets,
  Google OAuth, Cloudinary, Resend, Redis, SSLCommerz, ADMIN_*, GEMINI_API_KEY,
  CLIENT_URL). Redis/Resend/Gemini degrade gracefully when unset.
- Frontend: `frontend/.env.local.example` → `frontend/.env.local`
  (`NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_GOOGLE_CLIENT_ID`).

## Verification before finishing

- Backend: `npm run build --prefix backend` (tsc) and `npm run lint --prefix backend`.
- Frontend: `npm run build --prefix frontend` (or at minimum `npm run lint --prefix frontend`).
- If you changed the Prisma schema: `npx prisma validate` + `prisma generate`
  from `backend/`, and confirm `postman_collection.json` / READMEs still match.
