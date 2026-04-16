import type { ActivityWorkResult } from "./common.js";

/** Rolling window presets accepted by `GET /api/aw/snapshot`. */
export type SnapshotRange = "5m" | "15m" | "30m" | "1h" | "3h" | "1d";

/** Query params for `GET /api/aw/snapshot`. */
export type SnapshotQuery = {
  range: SnapshotRange;
  /** Optional cap per bucket (clamped server-side). */
  limit?: number;
  bucketId?: string;
  watcherCategory?: string;
};

/**
 * Successful snapshot payload (fields vary by ActivityWork version).
 * @see ActivityWork `app/api/aw/snapshot/route.ts`
 */
export type SnapshotOkFields = {
  range?: string;
  events?: unknown[];
  summary?: unknown;
  truncated?: boolean;
  [key: string]: unknown;
};

export type SnapshotResponse = ActivityWorkResult<SnapshotOkFields>;
