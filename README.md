# activitywork-sdk

Typed HTTP client for **ActivityWork** public APIs (see the packaged [`activitywork-runtime`](https://github.com/SarkarShubhdeep/activitywork-runtime) flow), aimed at **TimeHuddle** (and similar apps) so they never talk to ActivityWatch directly—only to ActivityWork over HTTP.

## Install

```bash
pnpm add @sarkarshubh/activitywork-sdk
# or: npm install @sarkarshubh/activitywork-sdk
```

Requires **Node 18+** (uses `fetch` and `AbortController`).

## Quick start (server-first)

```ts
import {
  createActivityWorkClient,
  getSnapshotUrl,
} from "@sarkarshubh/activitywork-sdk";

const client = createActivityWorkClient({
  baseUrl: process.env.ACTIVITYWORK_URL ?? "http://localhost:5601",
  timeoutMs: 12_000,
  healthTimeoutMs: 3_000,
  // Optional when ActivityWork is secured:
  // getToken: () => process.env.ACTIVITYWORK_TOKEN!,
});

const health = await client.checkHealth();
if (!health.healthy) {
  console.error(health);
  return;
}

const preview = await client.preview({ limit: 50 });
if (preview.ok) {
  console.log(preview.eventCount, preview.latestEventAt);
}

const snap = await client.snapshot({ range: "1h", bucketId: "my-bucket" });
if (snap.ok) {
  console.log(snap.summary);
}

// Open ActivityWork UI with the same query ActivityWork expects:
const href = getSnapshotUrl(client.baseUrl, { range: "1h" });
```

### Modular imports

```ts
import { fetchPreview, buildPreviewUrl } from "@sarkarshubh/activitywork-sdk/preview";
import { fetchSnapshot, getSnapshotUrl } from "@sarkarshubh/activitywork-sdk/snapshot";
```

Future tracked-apps parity will live under `@sarkarshubh/activitywork-sdk/apps` (stub today).

## API surface

Configurable **base URL** (default `http://localhost:5601`). Paths are relative to that origin.

| Area | Endpoint | SDK |
|------|----------|-----|
| Health / liveness | `GET /api/aw/preview?limit=1` | `client.checkHealth()` (short timeout, default 3s) |
| Preview | `GET /api/aw/preview` | `client.preview(query?)`, `buildPreviewUrl`, `buildPreviewSearchParams` |
| Snapshot | `GET /api/aw/snapshot` | `client.snapshot(query)`, `getSnapshotUrl`, `buildSnapshotSearchParams` |

**Source of truth for JSON shapes:** ActivityWork `app/api/aw/*` routes and `activitywork/lib/*`. When those change, bump this package’s semver and update [CHANGELOG.md](CHANGELOG.md).

## Buckets and defaults

Cross-origin **`localStorage`** on the ActivityWork origin is **not** available to TimeHuddle. Omitting bucket params relies on ActivityWork defaults. For deterministic behavior, pass explicit **`bucketId`** (and **`watcherCategory`** when supported). See [docs/buckets-and-defaults.md](docs/buckets-and-defaults.md).

## Errors

Thrown errors are subclasses of `ActivityWorkSDKError`:

- `ActivityWorkHttpError` — non-2xx HTTP
- `ActivityWorkParseError` — invalid JSON
- `ActivityWorkTimeoutError` — timeout / abort

JSON bodies with `{ ok: false, error }` are **returned** from `preview` / `snapshot` (not thrown) so you can narrow with `isActivityWorkOk`.

## Layout

```
activitywork-sdk/
  packages/
    activitywork-sdk/     # npm package: @sarkarshubh/activitywork-sdk
      src/
        client.ts
        endpoints/
          preview.ts
          snapshot.ts
          apps.ts          # stub for future routes
        types/
          preview.ts
          snapshot.ts
          common.ts
        errors.ts
        index.ts
  docs/
    activitywork-sdk-timehuddle-plan.md
    buckets-and-defaults.md
    npm-beta-publish-checklist.md
```

## Tooling

TypeScript (strict), **tsup** (ESM + CJS + types), **Vitest**, **ESLint** (typescript-eslint). From repo root: `pnpm install`, `pnpm clean` (removes `packages/activitywork-sdk/dist`), `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`.

## Publishing (first beta)

Step-by-step checklist before the first npm beta: [docs/npm-beta-publish-checklist.md](docs/npm-beta-publish-checklist.md).

## Milestones

| Phase | Deliverable | Status |
|-------|-------------|--------|
| **M0** | Workspace, CI, publishable package | Done |
| **M1** | Preview + `checkHealth` + types + errors + tests | Done |
| **M2** | Snapshot + `getSnapshotUrl` + types + tests | Done |
| **M3** | Bucket / watcher docs + query helpers | Done |
| **M4** | Apps / tracked-apps subpath stub | Done |

## Planning and coordination

- Handoff and naming: [docs/activitywork-sdk-timehuddle-plan.md](docs/activitywork-sdk-timehuddle-plan.md)
- Consider linking this repo from ActivityWork’s README as the HTTP contract consumer.

## Open questions

1. **Public package name** — published as **`@sarkarshubh/activitywork-sdk`**. To shorten (e.g. `@sarkarshubh/activitywork`), change `name` in `packages/activitywork-sdk/package.json` and README install lines before publish.
2. **Browser usage** — if you call ActivityWork from the browser, configure CORS on ActivityWork for the TimeHuddle origin.
3. **Auth** — use `getToken` / `defaultHeaders` on the client when deployments require credentials.

## License

MIT — see [LICENSE](LICENSE).
