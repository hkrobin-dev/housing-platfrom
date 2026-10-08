# Housing & Roommate Management Platform — Frontend

Next.js 14 (App Router) + TypeScript + Tailwind CSS frontend for the platform, covering
every backend module plus a floating AI assistant chat widget.

## Setup

```bash
npm install
cp .env.local.example .env.local     # set NEXT_PUBLIC_API_URL to your backend URL
npm run dev                          # http://localhost:3000
```

Make sure the backend (`../backend`, http://localhost:5000) is running first — this app talks
to it via `NEXT_PUBLIC_API_URL` (defaults to `http://localhost:5000/api/v1`).

## What's included

- **Public pages**: landing/search, property browse (city + type filter, pagination —
  all synced to the URL), property detail (room list, request a viewing, apply), roommate
  matching (profile form + scored matches for both roommates and rooms), plus About,
  Services, Contact (validated form), and Pricing with FAQ — all with SEO metadata
- **Pricing with real checkout**: Owner ৳499/mo and Manager ৳299/mo plans buy through
  `POST /subscriptions/checkout`, which creates a pending `Subscription` + `INITIATED`
  `Payment` and redirects to the real SSLCommerz hosted page. Gateway IPN/success is
  re-validated server-side before the plan activates for 30 days; receipts land in
  Payments History alongside rent & bill payments
- **Auth**: login (React Hook Form + Zod, Google login, **one-click Demo Login** for
  Admin / Owner / Tenant using `backend/prisma/seed.ts` credentials), register with role
  picker (Tenant / Owner / Manager), JWT stored in cookies with automatic silent refresh
  on 401 (see `lib/api.ts`); route-level protection in `middleware.ts` + UI-level
  `ProtectedRoute` with role-aware sidebar
- **Tenant dashboard**: My Applications (status filter in URL), My Leases → lease detail
  with rent schedule + "Pay Now" (redirects to SSLCommerz), Viewing Requests, Utility
  Bills → pay share, Payments History (`GET /payments/my`), Maintenance (create + list),
  Documents (upload + list), Notifications, Profile & Settings (validated form,
  `PATCH /users/me`)
- **Owner/Manager dashboard**: Properties list + create, and a single property page with  tabs for Rooms (create/list with live seat counts), Applications (approve/reject —
  approving triggers the backend's transaction-safe lease creation), Viewing Requests,
  Utility Bills (create + auto-split), Maintenance (status updates), plus Earnings &
  Analytics with Recharts charts
- **Admin dashboard**: aggregate stats with charts, user list (role filter + pagination in
  URL, ban/verify/role actions), Plan Requests (who paid for Owner/Manager plans with
  payment status + manual approve — successful payments auto-activate and grant the
  role), Reports & Analytics page with Recharts charts
- **Demo logins** (seeded by backend `npm run seed`):
  `admin@housing.com / Admin@12345`, `owner@housing.com / Owner@12345`,
  `tenant@housing.com / Tenant@12345`
- **Payment result pages**: `/payments/success`, `/fail`, `/cancel` — these are exactly
  the URLs the backend's SSLCommerz callback redirects the browser to
- **AI Assistant** (`components/ChatWidget.tsx`): floating chat button on every page,
  calls `POST /api/v1/assistant/chat` on the backend, which itself calls Gemini
  (Google Generative Language API) with a system prompt describing the platform and a live snapshot of
  available rooms so answers reference real listings

## Structure

```
app/
 ├─ page.tsx                     landing
 ├─ about/ services/ contact/ pricing/   public + SEO metadata
 ├─ login/, register/            auth (RHF + Zod, one-click demo logins)
 ├─ loading.tsx, error.tsx, not-found.tsx   global loading / error / 404
 ├─ properties/                  browse (city/type/page in URL) + [id] detail
 ├─ roommates/                   profile + matches
 ├─ payments/success|fail|cancel gateway redirect targets
 └─ dashboard/
     ├─ layout.tsx               role-aware sidebar (wraps ProtectedRoute)
     ├─ loading.tsx, error.tsx   section skeleton + boundary
     ├─ page.tsx                 overview/stats with Recharts charts
     ├─ properties/              owner: list + [id] tabbed management
     ├─ earnings/                owner: revenue + occupancy charts
     ├─ applications/            tenant: my applications (status in URL)
     ├─ leases/                  tenant: my leases + [id] rent schedule/pay
     ├─ viewing-requests/        tenant: my requests
     ├─ bills/                   tenant: my utility bill splits + pay
     ├─ payments/                tenant: payment history
     ├─ maintenance/             tenant: create/list requests
     ├─ documents/               upload/list
     ├─ notifications/           list + mark read
     ├─ profile/                 profile & settings form
     └─ admin/users|reports|subscriptions/   admin: user CRUD (page/role in URL) + plan requests + charts
middleware.ts                    route-level auth + ADMIN-only guard
components/                      Navbar, ChatWidget, Badge, Loader, Skeleton,
                                 EmptyState, ProtectedRoute
lib/                             api client (axios + refresh), auth context, shared types
```

## Notes / things to tighten before submission

- `dashboard/properties` fetches the owner/manager-scoped `GET /properties/my`
  endpoint (public browsing uses the cached public `GET /properties` list).
- File upload UI (property images, documents) posts directly to the backend's
  Cloudinary-backed endpoints — make sure `CLOUDINARY_*` env vars are set on the backend.
- The AI chat widget requires `GEMINI_API_KEY` to be set in the **backend's** `.env`
  — without it, the widget will show a friendly fallback error message.
- Styling is intentionally simple/functional (Tailwind utility classes) — swap in your
  own design system or component library if the assignment expects more polish.

## Build

```bash
npm run build
npm start
```

Deploy this to Vercel (native Next.js support) or alongside the backend on Render as a
second static/Node service — set `NEXT_PUBLIC_API_URL` to your deployed backend's URL.
