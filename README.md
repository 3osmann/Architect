# ATELIER MONOLITH — Architecture Portfolio + Admin CMS

Interactive portfolio for an architecture studio, fully driven by Postgres (Neon),
with a brutalist admin dashboard to control every part of the website.

**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · Framer Motion · React Three Fiber (drei) · PostgreSQL (Neon) · jose/session auth

---

## Getting started

```bash
npm install
npm run db:setup     # creates tables + seeds content + creates the admin user
npm run dev          # http://localhost:3000
npm run build && npm start
npm run typecheck
node scripts/e2e-check.mjs http://localhost:3000   # 24-point smoke test
```

Environment lives in `.env.local` (git-ignored):

```
DATABASE_URL=postgresql://…            # Neon pooler, sslmode=require
AUTH_SECRET=…                          # signs the admin session cookie
ADMIN_EMAIL=…  ADMIN_PASSWORD=…        # optional overrides for db:setup
```

## Admin dashboard

| URL | Purpose |
| --- | --- |
| `/admin/login` | Sign in (httpOnly session cookie, 7 days) |
| `/admin` | Overview — project stats, DB health, recent work |
| `/admin/projects` | Gallery CRUD + live/draft toggle + delete |
| `/admin/projects/new`, `/admin/projects/[id]` | Create / edit with live card preview |
| `/admin/content` | Edit **Hero, Philosophy, Contact, Navigation** |
| `/admin/account` | Change password, session info, sign out |

**Default credentials** (created by `npm run db:setup`):
`admin@monolith.studio` / `monolith2026` — **change it immediately** in *Admin → Account*.

## How content flows

```
Postgres (Neon)
 ├─ settings   (key → jsonb)   hero · philosophy · contact · nav
 ├─ projects   (CRUD, published flag, sort_order)
 └─ admin_users (scrypt password hashes)

lib/content.ts  ──►  app/page.tsx (force-dynamic server component)
                          │
                          └─ props ──► Navbar · Hero · Philosophy · ProjectGrid · Contact
```

- The homepage renders on every request (`force-dynamic`) — edits in the dashboard
  appear instantly, no rebuild or redeploy.
- Every read falls back to `lib/defaults.ts` if the DB is unreachable, so the public
  site can never render blank.
- Mutations only happen through `/api/*` route handlers, each guarded by
  `requireSession()` (+ middleware + layout re-checks as defence in depth).

## Security notes

1. **Rotate your database password.** The connection string was pasted into chat —
   anyone with it can read/write the DB. Regenerate the password in the Neon console
   and update `DATABASE_URL`.
2. **Change the admin password** on first login (`/admin/account`).
3. `AUTH_SECRET` should be a long random string in production
   (`openssl rand -hex 32`).
4. `.env.local` is git-ignored — never commit credentials.
5. Session: JWT (HS256) in an `httpOnly`, `SameSite=Lax` cookie; passwords hashed
   with Node's `scrypt` + per-user salt; login is origin-checked.
6. ⚠️ `npm audit` reports advisories in **Next.js 14 itself** (now EOL) — the fixes
   ship only in Next 15/16 (breaking). Worth planning an upgrade.

## Project structure

```
app/
  page.tsx                      # dynamic homepage (reads Postgres)
  template.tsx                  # route transitions
  admin/
    login/page.tsx              # sign-in screen
    (dashboard)/
      layout.tsx                # session guard + sidebar shell
      page.tsx                  # overview
      projects/…                # list · new · [id]
      content/page.tsx          # website content editor
      account/page.tsx          # password + session
  api/
    auth/{login,logout}/route.ts
    projects/route.ts  projects/[id]/route.ts
    settings/route.ts  account/password/route.ts
components/
  Navbar · Hero · Philosophy · ProjectGrid · Contact · Reveal · Preloader
  three/  Hero3D · Structure · CanvasLoader      # R3F scene
  admin/  AdminNav · ProjectForm · ProjectRow · ContentForms · PasswordForm
lib/
  db.ts (pg pool) · auth.ts (sessions/hashes) · content.ts (readers/writers)
  types.ts (all content shapes) · defaults.ts (fallback content + presets)
middleware.ts                   # edge guard for /admin/*
scripts/
  db-setup.mjs                  # schema + seed + admin user
  e2e-check.mjs                 # 24 assertions against a running server
```

## Database schema

```sql
projects   (id, title, location, year, category, ratio, tone, published, sort_order, created_at, updated_at)
settings   (key PK, value JSONB, updated_at)
admin_users(id, email UNIQUE, password_hash, created_at)
```

## Adding your own `.glb` / `.gltf` model

1. Put the file at `public/models/structure.glb`.
2. In `components/three/Structure.tsx`, set `USE_CUSTOM_MODEL = true`.

The `<Suspense>` boundary in `components/three/Hero3D.tsx` shows `CanvasLoader`
while it streams; `Preloader` tracks the same progress via drei's `useProgress`.

## Customization

- **Palette / type scale** — `tailwind.config.ts` (`ink`, `carbon`, `concrete`, `paper`, `steel`)
- **Fallback content** — `lib/defaults.ts` (also the seed used by `db:setup`)
- **Admin look** — `.admin-*` component classes in `app/globals.css`
- **Form delivery** — `components/Contact.tsx` → `handleSubmit()` (Resend/SendGrid)
- **Imagery** — project cards render gradient placeholders; swap for `next/image`
  when photography exists.
