# Cline Instructions — Choir Training App

This file is the persistent instruction set for Cline. `AGENTS.md` (Next.js auto-generated, re-added by `next dev`) and `CLAUDE.md` (@AGENTS.md) are intentionally left untouched.

## Tech stack (confirmed)
- Next.js 16 App Router, TypeScript strict, React 19, Tailwind CSS v4
- `@/*` alias → `./src/*` (tsconfig.json)
- Primary database: MongoDB (`mongodb` driver, `server-only`); Firebase is being removed — do not reintroduce Firestore or migrate back
- Scripts: `dev` (`next dev`), `build` (`next build`), `lint` (`eslint`), `typecheck` (`tsc --noEmit`)

## Rules

### Token efficiency
- Start each task by defining the exact outcome and the smallest relevant file set.
- Inspect files before editing; avoid re-reading files already inspected unless new info is needed.
- Use targeted searches, symbol/import lookups, and specific line ranges — not directory dumps or full-file reads.
- No broad codebase audits for localized tasks. No lengthy reports unless requested. No explanations of routine actions.

### Incremental editing (mandatory)
- Smallest correct patch over rewrite. Preserve structure, naming, formatting, comments, imports, exports, types, and behavior.
- Targeted edits to relevant functions/components/types/sections only. Never replace a whole file for a few-line change.
- Reuse existing components, services, hooks, utilities, types, and config. Do not recreate what exists.
- Follow existing patterns and abstractions. No unrelated refactoring or formatting churn.
- Before any large rewrite, confirm a localized patch won't suffice and explain why briefly.
- Inspect the diff after editing to confirm only intended changes.

### Protect existing work
- Run `git status --short` before modifying. Treat uncommitted/staged/untracked changes as user-owned.
- No `git reset --hard`, `git clean`, or broad checkout/restore. No committing, pushing, deploying, or deleting data unless explicitly requested.
- Don't assume untracked/deleted files are disposable. Preserve conflicting changes; ask before irreversible decisions.

### Architecture
- MongoDB is the primary app database. Keep DB access server-side; never expose credentials or call MongoDB from browser components.
- Reuse existing API routes, repositories, types, validation, and UI components.
- Preserve member, admin, practice, wallet, library, notifications, complaints, and settings functionality.
- Choir parts: Soprano, Alto, Tenor, Bass, plus subdivisions (Soprano 1/2, Tenor 1/2).
- Audio: references/metadata in MongoDB; binary audio in object/file storage.
- No new architecture or replacement of working subsystems without a clear requirement.

### Auth & financial safety
- Auth is deferred unless explicitly requested. Preserve existing Google sign-in and session code.
- Never trust client-side credit balances, payment-success claims, admin roles, or refund requests.
- Credit grants/deductions, payment verification, and refunds must be server-side, with idempotency safeguards.
- Do not weaken security rules or authorization checks. Identify security gaps honestly.

### Dependencies & config
- Prefer existing deps and native capabilities. Add a dep only when genuinely necessary (explain briefly).
- No package-manager/lockfile changes. Never overwrite `.env`, `.env.local`, deployment config, or secrets.
- Use env vars and placeholder-only `.env.example`. Never print secrets in logs, code, diffs, or reports.

### Testing & verification
- Run the smallest relevant check after each change: `typecheck` for TS, build/lint for UI/routing.
- Fix regressions from current changes only. Report what actually ran and its outcome — never claim unrun tests passed.
- Distinguish pre-existing failures from those introduced by current changes.

### Task workflow
1. Understand request; inspect only relevant files.
2. Identify existing implementations to reuse.
3. Make the smallest safe changes.
4. Review the diff.
5. Run relevant verification.
6. Short report: changes, checks, blockers, items requiring your action.

Complex work: split into small logical phases. Do not rebuild/regenerate large files each phase.

### Response style
- Concise and technical. No restating of prompts or project history. No unchanged-file listings.
- Report: files changed, checks performed, blockers, manual setup required. Actionable over explanatory.

### Maintenance
- Keep this file concise and cross-task stable. Do not copy the full app spec here.
- One instruction file only — do not create conflicting duplicates.