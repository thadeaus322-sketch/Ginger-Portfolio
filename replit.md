# Ginger Studios & Creatives

A premium photography and videography portfolio site with private client gallery delivery. Built for a studio in Abeokuta, Nigeria shooting weddings, portraits, birthdays, and brand films.

## Run & Operate

- `pnpm --filter @workspace/ginger-studios run dev` — run the frontend (port auto-assigned)
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)

## Stack

- Frontend: React + Vite + Tailwind CSS + Framer Motion + wouter
- Backend: Node.js + Express 5
- DB: PostgreSQL + Drizzle ORM
- Auth: HMAC-signed cookie tokens (no extra packages)
- Fonts: Fraunces (serif) + Inter (sans) via Google Fonts
- API codegen: Orval (from OpenAPI spec at `lib/api-spec/openapi.yaml`)

## Where things live

- `artifacts/ginger-studios/src/pages/` — page components (home, photography, videography, client-gallery, admin/*)
- `artifacts/ginger-studios/src/components/layout/` — public-layout (navbar + footer), admin-layout (sidebar)
- `artifacts/ginger-studios/public/images/` — all local image assets (logos, sample work, generated images)
- `artifacts/api-server/src/routes/` — auth, galleries, publicGallery, upload
- `artifacts/api-server/src/lib/auth.ts` — token signing + password hashing
- `lib/db/src/schema/galleries.ts` — DB schema (adminUsers + galleries tables)
- `lib/api-spec/openapi.yaml` — API contract (source of truth)

## Admin Access

Default dev credentials (set env vars to override):
- Email: `admin@gingerstudios.com`
- Password: `GingerStudios2026!`

Set `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH` (SHA256 hex of password), and `SESSION_SECRET` in env for production.

## Architecture decisions

- No Cloudinary yet — image URLs are entered manually by admin (paste URLs). Real upload needs Cloudinary or Replit Object Storage added later.
- Status (active/expiring_soon/expired/revoked) is computed dynamically from `expiresAt` and `isRevoked` columns — not stored as a DB enum.
- All asset imports replaced with `/images/` public paths to avoid Vite's `#`-in-filename bug.
- Google Drive integration is a placeholder button — needs Google OAuth connector to be wired up.

## Product

Public site: Home (preloader + cinematic hero + portfolio + services + testimonials), Photography (filterable masonry gallery), Videography (video reel grid).

Client Gallery: Private link `/gallery/:token` — validates token server-side, shows photos, download all (placeholder), save to Drive (placeholder). Expired links show a warm branded error page.

Admin Dashboard: `/admin` login → `/admin/dashboard` stats + gallery list → `/admin/galleries/new` create → `/admin/galleries/:id` manage.

## User preferences

- Light mode only — warm cream #FBF6EE background
- Brand: amber #F0961B (primary), maroon #5C1A20 (secondary)
- Fonts: Fraunces serif + Inter sans

## Gotchas

- Filenames with `#` or emoji characters cannot be used as Vite JS imports — copy to `public/images/` with clean names instead
- After any OpenAPI spec change, always run codegen before building
- DB push must run after schema changes: `pnpm --filter @workspace/db run push`
- Admin routes require `requireAdmin` middleware — the cookie is `gvs_auth`

## Pointers

- See the `pnpm-workspace` skill for workspace structure
- Google Drive integration: use the Replit integrations skill → ProposeIntegration for Google Drive OAuth
