# Firebase Firestore Schema & Setup

> Authentication is **deferred**. This document describes the Firestore data
> model, the safe pre-auth security posture, and the exact steps to configure
> the Firebase web app. Nothing here deploys, migrates, or bills anything.

## 1. Implementation status

| Area | Status |
|---|---|
| `src/lib/firebase.ts` | Lazy singleton init. Works with zero config (mock mode). `isFirestoreEnabled()` gates all Firestore access. Firestore = flag `NEXT_PUBLIC_USE_FIRESTORE=true` **plus** valid `NEXT_PUBLIC_FIREBASE_*` config. |
| `src/lib/firestore/types.ts` + `types-ledger.ts` | Typed document shapes for all 12 collections below. |
| `src/lib/firestore/mappers.ts` | Firestore `Timestamp` → ISO strings at UI edges; status-enum translation; joins song + parts + category. |
| `src/lib/firestore/*.repo.ts` | Read repositories: songs, categories, complaints (create allowed pre-auth by design note below), wallet **reads only**, notifications, admin reads. No client credit/payment writes exist anywhere. |
| `src/hooks/use-firestore-songs.ts` | `usePublishedSongs()` — mock by default, Firestore when enabled, graceful fallback to mock on error. |
| `src/app/(member)/songs/page.tsx` | Wired to the hook + `DataSourceBadge` (explicit Mock / Live / Fallback label). All other screens unchanged (still mock-backed). |
| `firestore.rules` | **Deny-all** pre-auth lockdown. Do NOT deploy permissive rules. |
| `firestore.indexes.json` | Composite indexes matching the repo queries. |
| `.env.example` | Placeholder config + the `NEXT_PUBLIC_USE_FIRESTORE` switch. `.env.local` (real keys) is git-ignored and untouched. |

## 2. Collections

### `songCategories` — doc ID = `slug`
| Field | Type | Required | Notes |
|---|---|---|---|
| `name` | string | yes | e.g. “Mass” |
| `slug` | string | yes | mirrors doc ID |
| `description` | string | no | |
| `sortOrder` | number | yes | filter-chip ordering |
| `status` | `active` \| `archived` | yes | only `active` listed |
| `createdAt` / `updatedAt` | Timestamp | yes | |

Derived from: `src/data/songs.ts` categories + `src/app/admin/categories/page.tsx`.
Replaces the hard-coded `["Mass", "Communion", "Anthems"]` via `listActiveCategories()`.

### `songs` — auto-ID
| Field | Type | Required | Notes |
|---|---|---|---|
| `title` | string | yes | prefix-searchable |
| `slug` | string | yes | URL-safe, unique |
| `description` | string | no | currently unused in UI; for detail pages later |
| `categoryId` | string | yes | doc ID of `songCategories` |
| `composer` | string | no | |
| `language` | string | no | future filter |
| `difficulty` | `easy` \| `medium` \| `hard` | no | future filter |
| `status` | `draft` \| `published` \| `archived` | yes | members see `published` only |
| `creditCost` | number | yes | display price; **not** authoritative for charging |
| `playCount` | number | yes | backend-aggregated later |
| `isNew` | boolean | no | “New songs” rail |
| `coverImagePath` | string | no | Storage path, not URL |
| `createdBy` | string | no | admin UID after auth |
| `createdAt` / `updatedAt` | Timestamp | yes | |

### `songParts` — auto-ID (top-level, scalable for S1/S2/T1/T2 splits)
| Field | Type | Required | Notes |
|---|---|---|---|
| `songId` | string | yes | parent `songs` doc ID |
| `name` | string | yes | display, e.g. “Soprano 1” |
| `voiceGroup` | `soprano` \| `alto` \| `tenor` \| `bass` | yes | |
| `subPart` | number \| null | no | `1`, `2`, …; null = single part |
| `audioStoragePath` | string | no | **Storage object path only** (e.g. `songs/{songId}/soprano-1.mp3`). Never bytes, never public URL. Empty today = player shows “not uploaded yet” (existing behavior). |
| `durationSeconds` | number | no | maps to `SongPart.duration` |
| `creditCost` | number | yes | per-part unlock price (display) |
| `status` | `draft` \| `published` | yes | |
| `sortOrder` | number | yes | S1 → S2 → A → T1 → T2 → B |
| `createdAt` / `updatedAt` | Timestamp | yes | |

Why top-level (not subcollection): parts are queried across songs for
filters (“Tenor 1”), counted per song in admin tables, and unlocked
individually. A `songId` equality + `sortOrder` index covers the access path.
Subcollections would be equally valid; top-level was chosen for cross-song
queries and simpler admin aggregation.


### `users` — doc ID = Firebase Auth UID (after auth; no real users created here)
| Field | Type | Required | Notes |
|---|---|---|---|
| `displayName` | string | yes | maps to `Member.name` |
| `email` | string | no | optional until auth |
| `role` | `member` \| `admin` | yes | set by backend only; never client-writable |
| `creditBalance` | number | yes | **display cache only**; ledger is truth |
| `status` | `active` \| `suspended` \| `pending` | yes | |
| `createdAt` / `updatedAt` | Timestamp | yes | |

### `userLibraries` — doc ID = `{userId}_{songId}`
Avoids duplicating song docs inside user records.
| Field | Type | Required | Notes |
|---|---|---|---|
| `userId` / `songId` | string | yes | |
| `saved` | boolean | yes | “Saved songs” section |
| `createdAt` / `updatedAt` | Timestamp | yes | |

### `partUnlocks` — doc ID = `{userId}_{songId}_{partId}`
“Unlocked songs” source. Written by backend alongside a `spend` ledger entry.
| Field | Type | Required | Notes |
|---|---|---|---|
| `userId` / `songId` / `partId` | string | yes | |
| `unlockedAt` | Timestamp | yes | |
| `transactionId` | string | no | link to the `spend` entry |

### `practiceProgress` — doc ID = `{userId}_{songId}_{partId}`
Backs `practiceStatus`, `lastPracticedAt`, and per-part play counts driving
“Recently practiced” / “Continue practicing” rails.
| Field | Type | Required | Notes |
|---|---|---|---|
| `userId` / `songId` / `partId` | string | yes | |
| `status` | `not-started` \| `in-progress` \| `completed` | yes | |
| `lastPracticedAt` | Timestamp | no | |
| `playCount` | number | yes | per-part counter |
| `updatedAt` | Timestamp | yes | |

### `creditTransactions` (append-only ledger) — auto-ID
| Field | Type | Required | Notes |
|---|---|---|---|
| `userId` | string | yes | |
| `type` | `purchase` \| `spend` \| `refund` \| `adjustment` \| `reversal` | yes | UI: `spend`→`usage`, others→`bonus` |
| `amount` | number | yes | signed: +granted, −spent |
| `status` | `pending` \| `completed` \| `failed` \| `reversed` | yes | reversals are new docs, never edits |
| `reference` | string | no | human reference |
| `description` | string | no | UI title |
| `relatedSongId` / `relatedPartId` | string | no | spend linkage |
| `idempotencyKey` | string | no | backend-set; prevents double-grants |
| `createdAt` | Timestamp | yes | pagination cursor |
| `metadata` | map | no | provider payloads (no secrets) |

### `payments` — auto-ID
| Field | Type | Required | Notes |
|---|---|---|---|
| `userId` | string | yes | |
| `provider` | `paystack` \| `flutterwave` \| `manual` | yes | matches `/admin/payments` placeholder copy |
| `providerReference` | string | no | set after provider callback |
| `amount` | number | yes | minor units (kobo) |
| `currency` | string | yes | e.g. `NGN` |
| `creditsToGrant` | number | yes | applied by backend only after verification |
| `status` | `pending` \| `successful` \| `failed` \| `refund_pending` \| `refunded` \| `reversed` | yes | backend transitions only |
| `createdAt` / `updatedAt` | Timestamp | yes | |

### `complaints` — auto-ID (matches existing UI + workflow)
| Field | Type | Required | Notes |
|---|---|---|---|
| `userId` | string \| null | no | null pre-auth |
| `userName` / `userEmail` | string | yes | admin table display |
| `subject` | string | yes | |
| `category` | 7-value enum (existing `ComplaintCategory`) | yes | |
| `description` | string | yes | maps from UI `message` |
| `status` | `open` \| `in_review` \| `resolved` | yes | UI UPPER_CASE; mappers translate |
| `createdAt` / `updatedAt` | Timestamp | yes | |

### `complaints/{id}/replies` (subcollection) — auto-ID
Scalable home for `adminResponse` + member follow-ups. `mapComplaint`
surfaces the latest admin reply as `adminResponse` so existing UI works.
| Field | Type | Required | Notes |
|---|---|---|---|
| `authorRole` | `member` \| `admin` | yes | |
| `authorName` | string | yes | |
| `message` | string | yes | |
| `createdAt` | Timestamp | yes | |

### `notifications` — auto-ID
| Field | Type | Required | Notes |
|---|---|---|---|
| `title` / `message` | string | yes | member notifications screen |
| `type` | `announcement` \| `purchase` \| `reminder` \| `system` | yes | |
| `published` | boolean | yes | only `true` listed |
| `targetAudience` | `all` \| `members` \| `admins` | yes | |
| `createdAt` | Timestamp | yes | |

### `notificationReads` — doc ID = `{userId}_{notificationId}`
Per-user read state, never a shared flag.
| Field | Type | Required | Notes |
|---|---|---|---|
| `userId` / `notificationId` | string | yes | |
| `readAt` | Timestamp | yes | |

### `creditPackages` — auto-ID
Replaces `src/data/credit-packages.ts`. Prices in **minor units** (`priceMinor`,
kobo); mappers convert to naira for the existing `CreditPackage.price` UI.
| Field | Type | Required | Notes |
|---|---|---|---|
| `credits` | number | yes | |
| `priceMinor` | number | yes | |
| `currency` | string | yes | `NGN` |
| `label` | string | no | “Popular”, “Best value” |
| `sortOrder` | number | yes | |
| `status` | `active` \| `archived` | yes | |
| `createdAt` / `updatedAt` | Timestamp | yes | |


## 3. Query patterns + required indexes

| Screen / repo fn | Query | Index (`firestore.indexes.json`) |
|---|---|---|
| Catalog `listPublishedSongs` | `songs where status==published orderBy title` + per-song `songParts where songId==X orderBy sortOrder` | songs(status,title); songParts(songId,sortOrder) |
| Category filter `listSongsByCategory` | `songs where status==published + categoryId==X orderBy title` | songs(status,categoryId,title) |
| Prefix search `searchSongs` | `title >= term && <= term\uf8ff` (full-text deferred to backend later) | songs(status,title) |
| Admin catalog `listAllSongsAdmin` | `songs orderBy updatedAt desc` | songs(updatedAt desc) |
| Chips `listActiveCategories` | `songCategories where status==active orderBy sortOrder` | songCategories(status,sortOrder) |
| Wallet `listLedgerForUser` | `creditTransactions where userId==X orderBy createdAt desc` | creditTransactions(userId,createdAt desc) |
| Admin ledger `listLedgerAdmin` | `creditTransactions orderBy createdAt desc` | creditTransactions(createdAt desc) |
| Admin payments `listPaymentsAdmin` | `payments orderBy createdAt desc` | payments(createdAt desc) |
| Complaints `listComplaints` | `complaints orderBy createdAt desc` (+`where userId==X` member view) | complaints(createdAt desc); complaints(userId,createdAt desc) |
| Notifications `listPublishedNotifications` | `notifications where published==true orderBy createdAt desc` | notifications(published,createdAt desc) |
| Packages `listActiveCreditPackages` | `creditPackages where status==active orderBy sortOrder` | creditPackages(status,sortOrder) |

All lists paginate (`limit` + cursors). No real-time listeners — one-shot
queries match every current screen.

### `appSettings/app` (single doc)
Only genuine app-wide settings: `supportedVoiceParts`

## 4. Client vs server operations

| Operation | Client (this app) | Trusted backend (later NestJS task) |
|---|---|---|
| List published songs / categories / packages / notifications | ✅ reads | — |
| Member reads own ledger / unlocks / library | ✅ reads (rules bind to `request.auth.uid` after auth) | — |
| Create complaint / member reply | ✅ allowed (rate-limited; App Check recommended) | moderation |
| Change complaint status / admin reply | ❌ never | ✅ admin SDK or claimed admin |
| Create / edit songs, parts, categories, packages, notifications | ❌ never | ✅ admin-only |
| Create / edit ledger, payments, balances, roles | ❌ never (`assertNoClientCreditWrites` throws) | ✅ atomic txns + idempotency |
| Verify payments, grant/refund/deduct credits | ❌ never; UI never fakes success | ✅ provider webhooks → verify → grant |
| Serve paid audio | ❌ no public URLs | ✅ signed expiring URLs after entitlement check |

## 5. Security assumptions + pre-auth posture

- `firestore.rules` is **deny-all**. Safe to deploy as-is; it intentionally
  blocks production reads until auth lands. No permissive rules anywhere.
- Hidden `/admin/*` routes and client role checks are UI only — never
  authorization.
- Until Firebase Authentication + `admin` custom claims land: user-specific
  data has no trustworthy owner binding, so admin/user screens stay
  mock-backed; only the public catalog (`/songs`) is Firestore-wired and
  only when explicitly enabled. Nothing user-scoped is production-secure yet.
- Post-auth rules sketch (for the auth task): catalog reads public; user docs
  owner-read; `userLibraries/partUnlocks/practiceProgress/notificationReads`
  owner-scoped via `request.auth.uid`; ledger/payments owner-read +
  backend-write-only; catalog/notifications writes require
  `request.auth.token.admin == true`.
- Never audio bytes in Firestore; never permanent public audio URLs for paid
  parts; never service-account keys in browser code.

(`["soprano","alto","tenor","bass"]`). No secrets — ever.


## 6. Configure the Firebase web app (exact steps)

1. Open the existing project in the Firebase Console (do not create a new one).
2. **Project settings (gear) → General → Your apps → Web (`</>`)**:
   if a web app exists, open **SDK setup and configuration → Config** and copy
   the values; otherwise **Add app → Web** (nickname e.g. `choir-song-app-web`,
   skip Hosting) and copy the config.
3. Create `.env.local` in the project root (never commit — already ignored):
   ```env
   NEXT_PUBLIC_USE_FIRESTORE=false

## 9. File map

| File | Purpose |
|---|---|
| `src/lib/firebase.ts` | Lazy Firebase client init (`getFirestore` guarded by `NEXT_PUBLIC_USE_FIRESTORE`); `isFirebaseConfigured`, `isFirestoreEnabled`; analytics requires config. |
| `src/lib/firestore/client.ts` | `requireDb()` + `canUseFirestore()` gate. |
| `src/lib/firestore/types.ts` | Catalog doc shapes (`SongDoc`, `SongPartDoc`, `UserDoc`, `LibraryItemDoc`, `PartUnlockDoc`, `PracticeProgressDoc`, `WithId`). |
| `src/lib/firestore/types-ledger.ts` | Ledger / payment / complaint / notification / package / settings shapes. |
| `src/lib/firestore/mappers.ts` | Firestore `Timestamp` → ISO; status enum translation; song/part/category/complaint/ledger/notification/member mappers. |
| `src/lib/firestore/songs.repo.ts` | Published catalog, by-ID, parts, search, category, admin list. |
| `src/lib/firestore/categories.repo.ts` | Active categories. |
| `src/lib/firestore/complaints.repo.ts` | Complaint list/create + reply subcollection. |
| `src/lib/firestore/wallet.repo.ts` | Read-only ledger history; **no client mutations** (`assertNoClientCreditWrites`). |
| `src/lib/firestore/notifications.repo.ts` | Published notifications + per-user read state. |
| `src/lib/firestore/admin.repo.ts` | Admin views for members, ledger, payments. |
| `src/hooks/use-firestore-songs.ts` | `usePublishedSongs()` + `useFirestoreMode()`. |
| `src/app/(member)/songs/page.tsx` | Catalog wired to the hook with `DataSourceBadge`. |
| `src/components/data/data-source-badge.tsx` | Mock / Live / Fallback badge. |
| `firestore.rules` | Deny-all pre-auth lockdown. |
| `firestore.indexes.json` | Composite indexes for all repo queries. |
| `docs/firebase-firestore-schema.md` | This document. |
| `.env.example` | Placeholder config + the `NEXT_PUBLIC_USE_FIRESTORE` switch. |

## 10. What remains before this is production-ready

1. **Firebase Authentication** (next task): `getAuth` + custom claims → rules unlock.
2. **Seed data**: create the actual Firestore docs from the live project.
3. **Audio**: Cloud Storage upload task →signed URLs + `audioStoragePath`.
4. **Payments**: verified webhook → `payments` doc + `creditTransactions` + credit grant via transaction.

   NEXT_PUBLIC_FIREBASE_API_KEY=…
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=….firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=…
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=….firebasestorage.app
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=…
   NEXT_PUBLIC_FIREBASE_APP_ID=…
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=…
   ```
4. Restart `npm run dev` after any `.env.local` change.
5. To try Firestore reads: seed the collections (§8), set
   `NEXT_PUBLIC_USE_FIRESTORE=true`, restart. The `/songs` badge flips from
   “Dev · Mock data” to “Live · Firestore” (or “Fallback · Mock data” with the
   error shown if queries fail).

## 7. Enable Firestore in the console

1. Console → **Build → Firestore Database → Create database**.
2. Start in **production mode** (deny-all matches `firestore.rules`).
3. Choose the region closest to members (cannot change later).
4. **Rules tab**: paste `firestore.rules` before seeding anything sensitive.
   Nothing deploys from this repo automatically — the Firebase CLI runs only
   on your explicit approval.
5. **Indexes tab**: create the composites in `firestore.indexes.json`, or run
   `firebase deploy --only firestore:indexes` after your explicit approval.

## 8. Seed shape (manual — do NOT auto-migrate mocks)

Create docs by hand in the console (or a backend seed script later):
- `songCategories/mass`: `{ name: "Mass", slug: "mass", sortOrder: 1, status: "active", createdAt/updatedAt: now }`
- `songs/{autoId}`: `{ title, slug, categoryId: "mass", status: "published", creditCost, playCount: 0, createdAt/updatedAt: now }`
- `songParts/{autoId}` × N: `{ songId, name: "Soprano 1", voiceGroup: "soprano", subPart: 1, creditCost, status: "published", sortOrder: 1, createdAt/updatedAt: now }` (leave `audioStoragePath` empty until the storage task)
- `creditPackages/{autoId}`: `{ credits: 100, priceMinor: 450000, currency: "NGN", label: "Popular", sortOrder: 2, status: "active", … }`
- `notifications/{autoId}`: `{ title, message, type: "announcement", published: true, targetAudience: "all", createdAt: now }`

Fictional mock records in `src/data/*` are intentionally NOT uploaded.
