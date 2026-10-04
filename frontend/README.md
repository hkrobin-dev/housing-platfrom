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

- **Public pages**: landing/search, property browse + filter by city, property detail
  (room list, request a viewing, apply), roommate matching (profile form + scored matches
  for both roommates and rooms)
- **Auth**: login, register with role picker (Tenant / Owner / Manager), JWT stored in
  cookies with automatic silent refresh on 401 (see `lib/api.ts`)
- **Tenant dashboard**: My Applications, My Leases → lease detail with rent schedule +
  "Pay Now" (redirects to SSLCommerz), Viewing Requests, Utility Bills → pay share,
  Maintenance (create + list), Documents (upload + list), Notifications
- **Owner/Manager dashboard**: Properties list + create, and a single property page with
  tabs for Rooms (create/list with live seat counts), Applications (approve/reject —
  approving triggers the backend's transaction-safe lease creation), Viewing Requests,
  Utility Bills (create + auto-split), Maintenance (status updates)
- **Admin dashboard**: aggregate stats, user list
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
 ├─ login/, register/            auth
 ├─ properties/                  browse + [id] detail
 ├─ roommates/                   profile + matches
 ├─ payments/success|fail|cancel gateway redirect targets
 └─ dashboard/
     ├─ layout.tsx               role-aware sidebar (wraps ProtectedRoute)
     ├─ page.tsx                 overview/stats
     ├─ properties/              owner: list + [id] tabbed management
     ├─ applications/            tenant: my applications
     ├─ leases/                  tenant: my leases + [id] rent schedule/pay
     ├─ viewing-requests/        tenant: my requests
     ├─ bills/                   tenant: my utility bill splits + pay
     ├─ maintenance/             tenant: create/list requests
     ├─ documents/               upload/list
     ├─ notifications/           list + mark read
     └─ admin/users/             admin: user list
components/                      Navbar, ChatWidget, Badge, Loader, ProtectedRoute
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
