# Plan: `activitywork-sdk` for TimeHuddle

This document is a handoff for work in a **separate repository** (`activitywork-sdk`) and/or a second Cursor window. It assumes **ActivityWork** (including the packaged [`activitywork-runtime`](https://github.com/SarkarShubhdeep/activitywork-runtime) flow) is stable locally alongside **ActivityWatch**, and that **TimeHuddle** will consume ActivityWork over HTTP without talking to ActivityWatch directly.

> **Naming:** This repo’s Meteor integration is documented as **TimeHarbor** ([`docs/timeharbor-quick-snapshot.md`](./timeharbor-quick-snapshot.md)). Treat **TimeHuddle** as the target product for this SDK; the same integration patterns (server-side health checks, snapshot links, base URL configuration) apply.

---

## 1. Goals

| Goal | Why |
|------|-----|
| **Typed, versioned HTTP client** for ActivityWork’s public APIs | TimeHuddle avoids duplicating URL construction, query params, and JSON parsing. |
| **Server-first usage** (Node, serverless, Meteor methods) | Matches TimeHarbor’s pattern: no CORS for health checks; secrets stay off the client where needed. |
| **Stable error model** | Map `ok: false`, HTTP 4xx/5xx, and timeouts to predictable errors for UI and logging. |
| **Optional browser bundle** | Only if TimeHuddle needs client-side calls; default story is server-side `fetch`. |

Non-goals for v0: wrapping ActivityWatch’s raw REST API (ActivityWork remains the single gateway), or embedding SQLite/catalog logic in the SDK.

---

## 2. API surface to cover (contract with ActivityWork)

Base URL is configurable (default `http://localhost:5601`). Paths below are relative to that origin.

### 2.1 Health / liveness (preview probe)

- **`GET /api/aw/preview?limit=1`**
- Success: JSON with `ok: true` (and typically `eventCount`, `latestEventAt`, etc.).
- Use this for **“ActivityWork + ActivityWatch path is healthy”** checks with a short timeout (TimeHarbor uses ~3s server-side).

### 2.2 Snapshot (time range + normalized events)

- **`GET /api/aw/snapshot`**
- **Query params (document in SDK):**
  - `range` — rolling window preset: `5m`, `15m`, `30m`, `1h`, `3h`, `1d` (invalid values → 400 with message).
  - `limit` — optional cap per bucket (clamped server-side).
  - Bucket selection — same mechanism as preview (e.g. `bucketId`, watcher category params as implemented by [`selectBucketIdsFromPreviewUrl`](../activitywork/lib/aw-preview-bucket-query.ts)); **defaults** apply when omitted (see [TimeHarbor snapshot note](./timeharbor-quick-snapshot.md): UI `localStorage` on ActivityWork origin is not visible to other apps).

### 2.3 Preview (discovery + sample)

- **`GET /api/aw/preview`**
- Useful for listing **buckets**, recent **sample** events, and `latestEventAt` for dashboards or debugging.

### 2.4 Future endpoints

If TimeHuddle needs **tracked apps / ignore list** parity, add SDK methods when those routes are finalized (`/api/apps/*`, `/api/aw/tracked-apps`, etc.). Keep the SDK modular (`preview`, `snapshot`, `apps`) so consumers import only what they need.

---

## 3. Repository shape (`activitywork-sdk`)

Suggested layout (adjust to team preference):

```
activitywork-sdk/
  packages/
    activitywork-sdk/     # main npm package: @scope/activitywork-sdk
      src/
        client.ts         # ActivityWorkClient class + factory
        endpoints/
          preview.ts
          snapshot.ts
        types/
          preview.ts
          snapshot.ts
          common.ts         # discriminated union: { ok: true } | { ok: false; error: string }
        errors.ts
        index.ts
      package.json
      tsconfig.json
  README.md
  LICENSE
```

**Tooling:** TypeScript, `tsup` or `unbuild` for ESM (+ optional CJS), strict `eslint` + `tsc`, CI on push.

**Versioning:** Start `0.x` until response shapes are frozen; document breaking changes in CHANGELOG.

---

## 4. SDK design checklist

1. **`ActivityWorkClient` config**
   - `baseUrl` (no trailing slash normalization in one place).
   - `fetch` injectable (for tests, undici, Meteor’s HTTP, etc.).
   - `timeoutMs` default aligned with ActivityWork’s ActivityWatch calls (~12s upstream is heavy; health checks should use a **separate shorter** timeout, e.g. 3–5s).

2. **Response typing**
   - Parse JSON once; narrow on `ok === true` vs `ok === false`.
   - Export TypeScript interfaces matching **current** ActivityWork responses (`snapshot` includes `range`, `events`, `summary`, `truncated`, etc.).

3. **Convenience helpers**
   - `checkHealth()` → `GET preview?limit=1` + boolean or small result type.
   - `getSnapshotUrl({ range, limit?, bucketId? })` → string for `window.open` or redirects (TimeHarbor-style FAB).

4. **Documentation**
   - README: install, config, TimeHuddle server example, link to ActivityWork repo for API truth.
   - Optional: OpenAPI generated from route handlers later; not required for v0.

5. **Testing**
   - Unit tests with mocked `fetch`.
   - Optional integration job: spin ActivityWork in CI or run against `localhost` in dev only.

---

## 5. TimeHuddle integration milestones

| Phase | Deliverable |
|-------|-------------|
| **M0** | Empty repo, CI, package published (GitHub Packages or npm private/public). |
| **M1** | `preview` + `checkHealth` + types; used from one TimeHuddle server path. |
| **M2** | `snapshot` + URL builder + full types; replace any hand-built URLs in TimeHuddle. |
| **M3** | Document **bucket / watcher** behavior for multi-watcher setups; optional SDK helpers that mirror ActivityWork query params. |
| **M4** | Additional endpoints (apps/catalog) if product requires them. |

---

## 6. Coordination with this monorepo (`activitywork`)

- **Source of truth:** Route handlers under `activitywork/app/api/aw/` and shared libs under `activitywork/lib/`.
- When ActivityWork changes JSON shape or query semantics, **bump SDK minor/major** and update CHANGELOG.
- Consider a short **“API contract”** section in ActivityWork’s root README linking to the SDK repo once it exists.

---

## 7. Open questions (resolve in TimeHuddle / SDK window)

1. **Package name and scope** (`@mie/activitywork-sdk`, `@timehuddle/activitywork-sdk`, etc.).
2. **Whether TimeHuddle is browser-heavy** — if yes, ship a browser-safe build and document CORS (ActivityWork must allow the TimeHuddle origin if calls are client-side).
3. **Auth** — today these routes appear **unauthenticated** for local LAN; if production adds tokens, the SDK needs `headers` / `getToken()` hooks from day one of that change.

---

## 8. Quick reference for the other Cursor session

- ActivityWork root README: [`README.md`](../README.md)
- Prior art (Meteor + server `fetch`): [`docs/timeharbor-quick-snapshot.md`](./timeharbor-quick-snapshot.md)
- Snapshot implementation: [`activitywork/app/api/aw/snapshot/route.ts`](../activitywork/app/api/aw/snapshot/route.ts)
- Preview implementation: [`activitywork/app/api/aw/preview/route.ts`](../activitywork/app/api/aw/preview/route.ts)
- Runtime tray (local shell): [`activitywork-runtime/apps/activitywork-tray/README.md`](../activitywork-runtime/apps/activitywork-tray/README.md)

When the SDK repo is created, add its URL here and optionally mirror this file or link from `README.md` in a follow-up PR.
