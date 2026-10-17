# Choir Training App

Production-ready frontend foundation for a mobile-first Choir Training PWA with a desktop-first admin console.

## Stack

- Next.js App Router
- React and TypeScript
- Tailwind CSS
- ESLint
- Lucide React icons
- `clsx` and `tailwind-merge`

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Useful checks:

```bash
npm run lint
npm run typecheck
npm run build
```

## Main Routes

Authentication:

- `/welcome`
- `/sign-in`
- `/sign-up`
- `/forgot-password`
- `/verify-email`
- `/reset-password`

Member app:

- `/home`
- `/songs`
- `/songs/[id]`
- `/songs/search`
- `/songs/filters`
- `/practice/[songId]/[partId]`
- `/library`
- `/wallet`
- `/wallet/buy`
- `/profile`
- `/notifications`
- `/complaints`
- `/complaints/new`
- `/complaints/[id]`

Admin app:

- `/admin`
- `/admin/songs`
- `/admin/categories`
- `/admin/members`
- `/admin/credits`
- `/admin/transactions`
- `/admin/payments`
- `/admin/complaints`
- `/admin/complaints/[id]`
- `/admin/notifications`
- `/admin/settings`

## Project Structure

```text
src/
  app/                 App Router routes and layouts
  components/          Reusable UI, layout, song, player, wallet, admin components
  data/                Typed local mock data
  services/            Repository-style access layer for data
  types/               Shared TypeScript models
  lib/                 Shared utilities
  hooks/               Client hooks for subscribed local repositories
  features/            Reserved for feature-specific modules
```

## Mock Data Approach

The UI reads through service modules in `src/services`. Those services currently return typed mock data from `src/data`, including dynamic song parts such as Soprano 1, Tenor 2, Alto, and Bass. Complaint mutations are persisted in browser local storage behind the same service abstraction so the repository can later be replaced with Firestore without changing page components.

Authentication is intentionally isolated in `src/services/auth.service.ts`. It provides mock async states, session persistence, email verification/recovery state, logout, and member/admin redirects. It is for UI development only and is not a security boundary.

Demo accounts use the password `Choir123!`:

- Member: `member@choir.app`
- Admin: `admin@choir.app`

## PWA

The app includes `public/manifest.webmanifest`, standalone display mode, theme/background colors, mobile viewport defaults, and a temporary SVG app icon. It is structured to remain compatible with future Capacitor Android packaging.

## Planned Next Stages

Firebase is intentionally not installed yet. Firebase Authentication, Cloud Firestore, and Cloud Storage can replace the current services later. A NestJS backend is also intentionally not built yet and can be introduced after the frontend workflow is stable.
