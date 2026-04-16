import type { ActivityWorkResult } from "./common.js";

/** Query params for `GET /api/aw/preview` (subset; extend as ActivityWork adds params). */
export type PreviewQuery = {
  /** Cap sample size (e.g. health uses `1`). */
  limit?: number;
  /** Single bucket id when narrowing selection (see ActivityWork bucket query helpers). */
  bucketId?: string;
  /** Watcher category filter when supported by ActivityWork. */
  watcherCategory?: string;
};

/**
 * Successful preview payload (fields vary by ActivityWork version).
 * @see ActivityWork `app/api/aw/preview/route.ts`
 */
export type PreviewOkFields = {
  eventCount?: number;
  latestEventAt?: string | null;
  buckets?: unknown[];
  events?: unknown[];
  [key: string]: unknown;
};

export type PreviewResponse = ActivityWorkResult<PreviewOkFields>;
