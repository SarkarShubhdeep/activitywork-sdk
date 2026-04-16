# Buckets, watchers, and defaults

TimeHuddle (and other apps) call ActivityWork **from their own origin**. ActivityWork’s web UI may persist bucket or watcher selection in **`localStorage` on the ActivityWork origin**. That storage is **not** visible to TimeHuddle, so **omitting** `bucketId` / `watcherCategory` on preview and snapshot requests relies on **ActivityWork server defaults** (whatever the ActivityWork deployment implements—see `selectBucketIdsFromPreviewUrl` and related helpers in the ActivityWork repo).

**Practical guidance**

- For **deterministic** behavior from TimeHuddle, pass explicit **`bucketId`** (and **`watcherCategory`** when your ActivityWork version supports it) using values you obtained earlier from `preview()` (e.g. listed buckets).
- Use **`buildPreviewSearchParams`** / **`buildSnapshotSearchParams`** from `activitywork-sdk` to keep query names aligned with ActivityWork.

When ActivityWork changes query semantics, bump the SDK semver and update the changelog.
