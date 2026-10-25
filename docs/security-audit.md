# Security Audit — Choir Training App

## Overview

Authentication is **entirely mocked/client-side**. There is no server-side session validation, no middleware, and no authorization on any Server Action or API route. Firebase Auth was removed; Google OAuth and session routes return 503/`user: null` stubs.

## Severity Findings

### Critical

| # | Finding | Files / Operations |
|---|---------|-------------------|
| C1 | **No server-side session validation.** Any client can call any Server Action or API route with no authentication check. | All Server Actions; `/api/auth/*` |
| C2 | **No authorization on admin Server Actions.** `createCategoryAction`, `updateCategoryAction`, `deleteCategoryAction`, `createSongAction` accept calls from any caller (including unauthenticated members). | `src/app/admin/categories/actions.ts`, `src/app/admin/songs/add/actions.ts` |
| C3 | **Client-side role assignment trusted.** `AuthBoundary` enforces roles only in the browser; a user can bypass it by calling server APIs directly. | `src/components/auth/auth-boundary.tsx` |
| C4 | **Passwords stored in plain text in localStorage.** Seed accounts include hardcoded passwords (`Choir123!`). | `src/services/auth.service.ts` (lines 39-42) |
| C5 | **`createUser` accepts a `role` parameter from the caller.** Mass-assignment risk — any caller could create an admin user. | `src/lib/mongodb/repos/users.repo.ts` (line 47-65) |
| C6 | **`createCreditTransaction` accepts `userId` from the caller.** Could credit/debit any user's account. | `src/lib/mongodb/repos/wallet.repo.ts` |
| C7 | **`confirmPayment` has no authorization.** Any server-side caller can mark any payment as successful/failed. | `src/lib/mongodb/repos/payments.repo.ts` |
| C8 | **`adjustCreditBalance` has no authorization.** Any server-side caller can change any user's balance. | `src/lib/mongodb/repos/users.repo.ts` |

### High

| # | Finding | Files / Operations |
|---|---------|-------------------|
| H1 | **No Next.js middleware.** No route-level protection; all routes are accessible without auth. | None exists |
| H2 | **Session cookie defined but never set/validated.** `SESSION_COOKIE = "choir.session.v1"` exists in `/api/auth/session` but is only deleted, never minted or read. | `src/app/api/auth/session/route.ts` |
| H3 | **Google sign-in is a stub that returns the demo member account.** No real OAuth verification; no account status or role checks. | `src/services/auth.service.ts` (lines 211-223), `src/app/api/auth/google/route.ts` |
| H4 | **No rate limiting on sign-in/sign-up.** Brute-force and enumeration possible. | `src/services/auth.service.ts` |
| H5 | **No email verification token expiration or one-time-use enforcement.** | `src/services/auth.service.ts` |
| H6 | **No super-admin role distinction.** Only `member`/`admin` exist; no privileged role for role management. | `src/lib/mongodb/types.ts` (`UserRole`) |

### Medium

| # | Finding | Files / Operations |
|---|---------|-------------------|
| M1 | **Password reset uses a pending-email key with no expiration or binding to a specific reset token.** | `src/services/auth.service.ts` |
| M2 | **`listLedgerForUser` filters by caller-supplied `userId`** — a user could read another user's ledger if they guess the ID. | `src/lib/mongodb/repos/wallet.repo.ts` |
| M3 | **`getLibraryItem` / `isSongSaved` filter by caller-supplied `userId`** — same cross-user read risk. | `src/lib/mongodb/repos/library.repo.ts` |
| M4 | **Database errors could leak internal details** if not caught at the API boundary. | All repos |

### Public Routes (by design)

- `/` (home/landing)
- `/welcome`
- `/sign-in`, `/sign-up`
- `/forgot-password`, `/reset-password`
- `/verify-email`
- `/songs`, `/songs/[id]`, `/songs/search`, `/songs/filters` (catalog is public)

### Operations Requiring a Signed-In User

- `/wallet`, `/wallet/buy` — credit balance and transactions
- `/library` — saved/unlocked songs
- `/notifications` — personal notifications
- `/complaints`, `/complaints/new`, `/complaints/[id]` — user complaints
- `/practice/[songId]/[partId]` — practice progress
- `/profile` — user profile
- `/rooms/[id]` — room membership

### Operations Requiring Administrator

- `/admin/songs` — create/edit/delete songs
- `/admin/categories` — create/edit/archive categories
- `/admin/members` — view member records
- `/admin/credits` — credit management
- `/admin/payments` — payment records
- `/admin/transactions` — transaction ledger
- `/admin/complaints`, `/admin/complaints/[id]` — complaint replies
- `/admin/settings` — app settings
- `/admin/notifications` — publish notifications

### Remediation Plan

1. Create server-side session validation (`src/lib/auth/session.ts`) using Next.js cookies.
2. Create authorization helpers (`src/lib/auth/require.ts`): `requireUser`, `requireAdmin`, `requireSuperAdmin`.
3. Protect all Server Actions and API routes with session + role checks.
4. Fix mass assignment in `createUser` — remove caller-supplied `role`.
5. Fix `createCreditTransaction` — derive `userId` from session, not caller input.
6. Fix `confirmPayment` — require admin authorization.
7. Fix `adjustCreditBalance` — require admin authorization.
8. Add cookie security attributes (`HttpOnly`, `Secure` in prod, `SameSite=Lax`).
9. Implement real session validation in `/api/auth/session` GET.
10. Add ownership checks to user-scoped reads (ledger, library).
