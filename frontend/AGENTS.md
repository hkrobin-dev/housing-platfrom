# AGENTS.md — frontend

Next.js 14 App Router + TypeScript + Tailwind CSS. Requires the backend running
first. Deploys to Vercel — set `NEXT_PUBLIC_API_URL` to the deployed backend URL.

## Commands (run from `frontend/`)

```bash
npm install
cp .env.local.example .env.local   # NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
npm run dev                         # http://localhost:3000
npm run build && npm start          # production
npm run lint                        # next lint
```

Path alias `@/* → ./*` (`tsconfig.json`). Images from `res.cloudinary.com`
are allow-listed in `next.config.js`.

## Structure

```
app/
  layout.tsx              AuthProvider + Navbar + ChatWidget + Toaster + Google GSI script
  page.tsx                landing
  login/ register/ forgot-password/ reset-password/ verify-email/
  properties/             browse (city filter) + [id] detail (rooms, viewing request, apply)
  roommates/              profile form + scored roommate/room matches
  payments/success|fail|cancel/   SSLCommerz redirect targets (must match backend callback URLs)
  dashboard/
    layout.tsx            ProtectedRoute wrapper + role-aware sidebar
    page.tsx              overview/stats
    properties/           owner list + [id] tabbed manage
                          (Rooms / Applications / Viewings / Bills / Maintenance)
    applications/ leases/ leases/[id]/ viewing-requests/ bills/
    maintenance/ documents/ notifications/ admin/users/
components/  Navbar (glass, active links, mobile menu), Footer, ChatWidget
             (gradient header, quick prompts, every page via layout), ProtectedRoute,
             GoogleLoginButton, Badge, Loader, Skeleton (SkeletonGrid for lists),
             EmptyState (empty lists with optional action)
lib/         api.ts (axios + refresh), auth-context.tsx, types.ts
```

## Invariants — do not break

1. **API client (`lib/api.ts`)**: base URL is `NEXT_PUBLIC_API_URL` fallback
   `http://localhost:5000/api/v1`. Request interceptor injects the
   `accessToken` cookie as `Bearer`. Response interceptor does ONE silent
   refresh (`POST /auth/refresh`, queued via `isRefreshing` + `pendingQueue`)
   then retries; on failure it clears both cookies and redirects to `/login`.
   Use `getErrorMessage(err)` for toasts — backend errors arrive as
   `{ success: false, message }`.
2. **Auth (`lib/auth-context.tsx`)**: `user/loading/login/register/
   loginWithGoogle/logout/refreshUser`, `GET /auth/me`, cookies
   `accessToken` (1 d) / `refreshToken` (7 d), toast + `router.push(/dashboard)`
   on success. Google GSI needs `NEXT_PUBLIC_GOOGLE_CLIENT_ID`.
3. **Route protection**: wrap dashboard sections in `ProtectedRoute`
   (`allow?: Role[]`); it redirects to `/login` (unauthenticated) or
   `/dashboard` (wrong role). New role-gated pages must pass `allow`.
4. **Owner property data**: `dashboard/properties` uses the scoped
   `GET /properties/my` — do not revert to filtering the public list.
5. **Payments**: lease "Pay Now" and bill-share pay redirect to SSLCommerz;
   `/payments/success|fail|cancel` must stay in sync with the backend's
   callback redirect URLs.
6. **AI chat (`ChatWidget.tsx`)**: floats on every page, calls
   `POST /assistant/chat`. Needs `GEMINI_API_KEY` set on the BACKEND —
   handle its fallback error gracefully, don't remove it.

## Conventions

- Styling: Tailwind utilities + shared helpers in `app/globals.css`
  (`.btn-primary/.btn-secondary/.btn-danger/.input/.card/.badge`) and brand
  palette `brand.{50,100,500,600,700}` (`tailwind.config.ts`). Icons via
  `lucide-react`, toasts via `react-hot-toast`.
- Types: extend `lib/types.ts` alongside any backend model change
  (`ApiResponse<T>` mirrors the backend envelope).
- Keep `frontend/README.md` structure diagram current when adding routes.
