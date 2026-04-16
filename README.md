# activitywork-sdk

Typed HTTP client for **[ActivityWork](https://github.com/SarkarShubhdeep/activitywork-runtime)** public APIs, aimed at **TimeHuddle** (and similar apps) so they never talk to ActivityWatch directly—only to ActivityWork over HTTP.

This repository is **scaffolding (M0)**. The package, types, and CI will land in follow-up milestones.

---

## Goals

| Goal | Why |
|------|-----|
| **Typed, versioned HTTP client** for ActivityWork’s public APIs | Consumers avoid duplicating URL construction, query params, and JSON parsing. |
| **Server-first** (Node, serverless, Meteor methods) | No CORS for health checks; secrets stay off the client where needed. |
| **Stable error model** | Map `ok: false`, HTTP 4xx/5xx, and timeouts to predictable errors. |
| **Optional browser bundle** | Only if a product needs client-side calls; default is server-side `fetch`. |

**Non-goals for v0:** wrapping ActivityWatch’s raw REST API, or embedding SQLite/catalog logic in the SDK.

---

## API surface (contract with ActivityWork)

Configurable **base URL** (default `http://localhost:5601`). Paths are relative to that origin.

| Area | Endpoint | Notes |
|------|----------|--------|
| Health / liveness | `GET /api/aw/preview?limit=1` | Short timeout (e.g. 3–5s) for “ActivityWork + ActivityWatch path is healthy.” |
| Snapshot | `GET /api/aw/snapshot` | Query: `range` (`5m`, `15m`, `30m`, `1h`, `3h`, `1d`), optional `limit`, bucket params as in ActivityWork. |
| Preview | `GET /api/aw/preview` | Buckets, sample events, `latestEventAt`. |

Future: tracked apps / ignore list when routes are finalized—keep the SDK modular (`preview`, `snapshot`, `apps`).

---

## Planned layout

```
activitywork-sdk/
  packages/
    activitywork-sdk/     # npm package (scope TBD, e.g. @scope/activitywork-sdk)
      src/
        client.ts
        endpoints/
          preview.ts
          snapshot.ts
        types/
          preview.ts
          snapshot.ts
          common.ts
        errors.ts
        index.ts
      package.json
      tsconfig.json
  README.md
  LICENSE
```

**Tooling (planned):** TypeScript, `tsup` or `unbuild` for ESM (+ optional CJS), strict ESLint + `tsc`, CI on push. Versioning starts at **0.x** until response shapes are frozen; breaking changes in **CHANGELOG**.

---

## Milestones

| Phase | Deliverable |
|-------|-------------|
| **M0** | Empty repo, README, CI, published package (GitHub Packages or npm). ← *you are here* |
| **M1** | `preview` + `checkHealth` + types; one server path in TimeHuddle. |
| **M2** | `snapshot` + URL builder + full types. |
| **M3** | Bucket / watcher docs and optional helpers for multi-watcher setups. |
| **M4** | Additional endpoints (apps/catalog) if needed. |

---

## Coordination

- **Source of truth for HTTP JSON:** ActivityWork route handlers under `activitywork/app/api/aw/` and libs under `activitywork/lib/`.
- **Planning doc** (handoff, naming, open questions): `docs/activitywork-sdk-timehuddle-plan.md` in the **ActivityWork** repository. If you keep this SDK folder next to that repo on disk, the file sits one level up under `docs/`.

---

## Open questions

1. Package **name and scope** (`@mie/activitywork-sdk`, `@timehuddle/activitywork-sdk`, etc.).
2. **Browser vs server** — if browser-heavy, ship a browser-safe build and document CORS for the TimeHuddle origin.
3. **Auth** — routes are unauthenticated on typical LAN setups; production tokens would need `headers` / `getToken()` hooks in the client.

---

## License

*To be added* (match ActivityWork or your org’s default).
