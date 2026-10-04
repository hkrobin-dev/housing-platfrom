# Housing & Roommate Management Platform (Monorepo)

```
housing-platform-monorepo/
├── backend/     Node.js + Express + TypeScript + PostgreSQL/Prisma API
└── frontend/    Next.js 14 + TypeScript + Tailwind CSS UI
```

Each folder is a fully independent project with its own `package.json` — this root just
ties them together for convenience. See `backend/README.md` and `frontend/README.md` for
full details on each.

## Quick Start (run both together)

```bash
# 1. Install everything
npm run install:all

# 2. Configure environment
cp backend/.env.example backend/.env              # fill in DATABASE_URL, JWT secrets,
                                                    # Cloudinary, SSLCommerz, Google OAuth,
                                                    # and GEMINI_API_KEY for the AI assistant
cp frontend/.env.local.example frontend/.env.local # NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1

# 3. Set up the database
npm run prisma:generate
npm run prisma:migrate
npm run seed          # creates the demo admin account

# 4. Run both (in two terminals)
npm run dev:backend    # http://localhost:5000
npm run dev:frontend   # http://localhost:3000
```

## What's in each folder

### `backend/`
- REST API: auth (JWT + Google OAuth), properties, rooms (transaction-safe seat
  reservation), roommate matching, viewing requests, applications → lease workflow
  (transaction-safe approval), rent scheduling, utility bill splitting, maintenance,
  documents, notifications, SSLCommerz payments, admin/owner dashboards, and an AI
  assistant endpoint backed by the Google Gemini API
- `prisma/schema.prisma` — full relational schema
- `postman_collection.json` — importable API documentation
- `render.yaml` — deployment config

### `frontend/`
- Every module has a corresponding page: public browse/search, roommate matching,
  tenant dashboard (applications, leases, rent, bills, maintenance, documents,
  notifications), owner/manager dashboard (properties, rooms, application review,
  viewing requests, utility bills, maintenance), admin dashboard (stats, users)
- Floating AI chat widget on every page, talking to `backend`'s `/assistant/chat`

## Deploying

- **Backend** → Render, using `backend/render.yaml` (provisions Postgres + the API)
- **Frontend** → Vercel (native Next.js support) — set `NEXT_PUBLIC_API_URL` to your
  deployed backend URL in the Vercel project's environment variables

## Assignment Requirement Checklist

See `backend/README.md` for the full checklist (API docs, consistent responses, 20+
commits, validation, RBAC, admin credentials, real payment, PostgreSQL+Prisma,
deployment, video walkthrough) — all backend-side requirements, still applicable here.
