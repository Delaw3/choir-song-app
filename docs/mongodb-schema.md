# MongoDB Schema — Choir Training App

Database: `choir-song` (configurable via `MONGODB_DB_NAME`)

## Collections

### `users`
Member and admin accounts. One doc per user.

| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | Primary key |
| `displayName` | string | Required |
| `email` | string | Lowercased, unique index |
| `role` | `"member" \| "admin"` | Default `"member"` |
| `creditBalance` | number | Default `0`. Server-only source of truth |
| `status` | `"active" \| "suspended" \| "pending"` | Default `"active"` |
| `createdAt` | Date | |
| `updatedAt` | Date | |

**Indexes:** `email` (unique), `role`, `status`

### `songs`

### `songParts`
Voice parts for each song. One doc per part.

| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | Primary key |
| `songId` | string | References `songs._id` |
| `name` | string | Display name |
| `voiceGroup` | `"soprano" \| "alto" \| "tenor" \| "bass"` | |
| `subPart` | number \| null | Subdivision |
| `audioStoragePath` | string | Storage path |
| `audioUrl` | string | Public URL |
| `durationSeconds` | number | Optional |
| `creditCost` | number | Required |
| `status` | `"draft" \| "published"` | |
| `sortOrder` | number | Display order |
| `createdAt` | Date | |
| `updatedAt` | Date | |

**Indexes:** `songId`, `voiceGroup`, `sortOrder`

### `songCategories`
Song categories.

| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | Primary key |
| `name` | string | Required |
| `slug` | string | Required, unique |
| `description` | string | Optional |
| `sortOrder` | number | |
| `status` | `"active" \| "archived"` | Default `"active"` |
| `createdAt` | Date | |
| `updatedAt` | Date | |

**Indexes:** `slug` (unique), `status`, `sortOrder`
Catalog songs.


### `userLibraries`
Saved/unsaved songs per user.

| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | Primary key |
| `userId` | string | References `users._id` |
| `songId` | string | References `songs._id` |
| `saved` | boolean | |
| `createdAt` | Date | |
| `updatedAt` | Date | |

**Indexes:** `userId` + `songId` (unique), `userId`

### `practiceProgress`
Practice progress per user/song/part.

| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | Primary key |
| `userId` | string | References `users._id` |
| `songId` | string | References `songs._id` |
| `partId` | string | References `songParts._id` |
| `status` | `"not-started" \| "in-progress" \| "completed"` | |
| `lastPracticedAt` | Date | Optional |
| `playCount` | number | Default `0` |
| `updatedAt` | Date | |

**Indexes:** `userId` + `songId` + `partId` (unique), `userId`

### `creditTransactions`
Auditable credit ledger.

| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | Primary key |
| `userId` | string | References `users._id` |
| `type` | `"purchase" \| "spend" \| "refund" \| "adjustment" \| "reversal"` | |
| `amount` | number | Positive = credit granted |
| `status` | `"pending" \| "completed" \| "failed" \| "reversed"` | |
| `reference` | string | Optional external reference |
| `description` | string | Human-readable |

### `payments`
Payment records.

| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | Primary key |
| `userId` | string | References `users._id` |
| `provider` | `"paystack" \| "flutterwave" \| "manual"` | |
| `providerReference` | string | External reference / idempotency key |
| `amount` | number | |
| `currency` | string | |
| `creditsToGrant` | number | |
| `status` | `"pending" \| "successful" \| "failed" \| "refund_pending" \| "refunded" \| "reversed"` | |
| `createdAt` | Date | |
| `updatedAt` | Date | |

**Indexes:** `userId`, `providerReference` (unique), `status`, `createdAt`

### `complaints`
Support complaints.

| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | Primary key |
| `userId` | string \| null | References `users._id` |
| `userName` | string | |
| `userEmail` | string | |
| `subject` | string | |
| `category` | enum | |
| `description` | string | |
| `status` | `"open" \| "in_review" \| "resolved"` | |
| `createdAt` | Date | |
| `updatedAt` | Date | |

**Indexes:** `userId`, `status`, `createdAt`

### `complaintReplies`
Replies to complaints.

| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | Primary key |
| `complaintId` | string | References `complaints._id` |
| `authorRole` | `"member" \| "admin"` | |
| `authorName` | string | |
| `message` | string | |
| `createdAt` | Date | |

**Indexes:** `complaintId`

### `notifications`
Published announcements.

| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | Primary key |
| `title` | string | |
| `message` | string | |
| `type` | `"announcement" \| "purchase" \| "reminder" \| "system"` | |
| `published` | boolean | |
| `targetAudience` | `"all" \| "members" \| "admins"` | |
| `createdAt` | Date | |

**Indexes:** `published`, `createdAt`

### `notificationReads`
Read receipts per user/notification.

| Field | Type | Notes |

## Field Conventions

- **IDs:** String IDs exposed to the UI are MongoDB `_id` hex strings. Repo layers convert via `doc._id!.toString()`.
- **Dates:** Stored as MongoDB `Date` objects; converted to ISO strings at repo/UI boundaries.
- **Storage paths:** Audio and sheet files are stored in Supabase Storage; only paths/URLs are stored in MongoDB — never binary audio.
- **Server-only:** All repo modules import `"server-only"` and must not be imported from `"use client"` components.

## Indexes Summary

| Collection | Index Fields | Type |
|------------|-------------|------|
| `users` | `email` | unique |
| `users` | `role` | |
| `songs` | `slug` | unique |
| `songs` | `status` | |
| `songs` | `categoryId` | |
| `songParts` | `songId` | |
| `songParts` | `songId` + `voiceGroup` | |
| `songCategories` | `slug` | unique |
| `userLibraries` | `userId` + `songId` | unique |
| `practiceProgress` | `userId` + `songId` + `partId` | unique |
| `creditTransactions` | `idempotencyKey` | unique |
| `creditTransactions` | `userId` | |
| `payments` | `providerReference` | unique |
| `complaints` | `userId` | |
| `complaints` | `status` | |
| `notifications` | `published` | |
| `creditPackages` | `status` | |
|-------|------|-------|
| `_id` | ObjectId | Primary key |
| `userId` | string | References `users._id` |
| `notificationId` | string | References `notifications._id` |
| `readAt` | Date | |

**Indexes:** `userId`, `notificationId`

### `creditPackages`
Credit bundle catalog.

| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | Primary key |
| `credits` | number | |
| `priceMinor` | number | Price in minor currency units |
| `currency` | string | |
| `label` | string | Optional |
| `sortOrder` | number | |
| `status` | `"active" \| "archived"` | |
| `createdAt` | Date | |
| `updatedAt` | Date | |

**Indexes:** `status`, `sortOrder`
| `idempotencyKey` | string | Unique, prevents duplicates |
| `metadata` | object | Optional |
| `createdAt` | Date | |
| `updatedAt` | Date | |

**Indexes:** `userId`, `idempotencyKey` (unique), `createdAt`
| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | Primary key |
| `title` | string | Required |
| `slug` | string | Required, unique index |
| `description` | string | Optional |
| `categoryId` | string | References `songCategories._id` |
| `composer` | string | Optional |
| `language` | string | Optional |
| `difficulty` | `"easy" \| "medium" \| "hard"` | Optional |
| `status` | `"draft" \| "published" \| "archived"` | Required |
| `creditCost` | number | Required |
| `playCount` | number | Default `0` |
| `isNew` | boolean | Optional |
| `coverImagePath` | string | Storage path reference |
| `sheetUrl` | string | Public sheet music URL |
| `subCategory` | string | Optional (Mass sub-categories) |
| `createdBy` | string | References `users._id` |
| `createdAt` | Date | |
| `updatedAt` | Date | |

**Indexes:** `slug` (unique), `status`, `categoryId`, `title` (text)