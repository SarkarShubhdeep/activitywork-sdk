import { requestJson } from "../internal/request.js";
import { buildUrl, normalizeBaseUrl } from "../internal/url.js";
import type { SnapshotQuery, SnapshotResponse } from "../types/snapshot.js";

const SNAPSHOT_PATH = "/api/aw/snapshot";

/** Build `URLSearchParams` for snapshot requests (stable param names vs ActivityWork). */
export function buildSnapshotSearchParams(query: SnapshotQuery): URLSearchParams {
  const params = new URLSearchParams();
  params.set("range", query.range);
  if (query.limit !== undefined) {
    params.set("limit", String(query.limit));
  }
  if (query.bucketId !== undefined) {
    params.set("bucketId", query.bucketId);
  }
  if (query.watcherCategory !== undefined) {
    params.set("watcherCategory", query.watcherCategory);
  }
  return params;
}

export function getSnapshotUrl(
  baseUrl: string | undefined,
  query: SnapshotQuery,
): string {
  const base = normalizeBaseUrl(baseUrl);
  const search = buildSnapshotSearchParams(query);
  return buildUrl(base, SNAPSHOT_PATH, search);
}

export type FetchSnapshotContext = {
  baseUrl: string;
  fetchImpl: typeof fetch;
  timeoutMs: number;
  defaultHeaders?: HeadersInit;
  getToken?: () => string | Promise<string>;
};

export async function fetchSnapshot(
  ctx: FetchSnapshotContext,
  query: SnapshotQuery,
): Promise<SnapshotResponse> {
  const url = getSnapshotUrl(ctx.baseUrl, query);
  return requestJson<SnapshotResponse>({
    url,
    fetchImpl: ctx.fetchImpl,
    timeoutMs: ctx.timeoutMs,
    headers: ctx.defaultHeaders,
    getToken: ctx.getToken,
  });
}
