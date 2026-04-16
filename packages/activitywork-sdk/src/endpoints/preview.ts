import { ActivityWorkSDKError } from "../errors.js";
import { requestJson } from "../internal/request.js";
import { buildUrl, normalizeBaseUrl } from "../internal/url.js";
import type { PreviewQuery, PreviewResponse } from "../types/preview.js";

const PREVIEW_PATH = "/api/aw/preview";

/** Append preview query params; omits undefined values. */
export function appendPreviewQueryParams(
  params: URLSearchParams,
  query?: PreviewQuery,
): URLSearchParams {
  if (!query) {
    return params;
  }
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

/** Fresh `URLSearchParams` for preview requests (symmetric with `buildSnapshotSearchParams`). */
export function buildPreviewSearchParams(query?: PreviewQuery): URLSearchParams {
  return appendPreviewQueryParams(new URLSearchParams(), query);
}

export function buildPreviewUrl(
  baseUrl: string | undefined,
  query?: PreviewQuery,
): string {
  const base = normalizeBaseUrl(baseUrl);
  const search = buildPreviewSearchParams(query);
  return buildUrl(base, PREVIEW_PATH, search);
}

export type FetchPreviewContext = {
  baseUrl: string;
  fetchImpl: typeof fetch;
  timeoutMs: number;
  defaultHeaders?: HeadersInit;
  getToken?: () => string | Promise<string>;
};

export async function fetchPreview(
  ctx: FetchPreviewContext,
  query?: PreviewQuery,
): Promise<PreviewResponse> {
  const url = buildPreviewUrl(ctx.baseUrl, query);
  return requestJson<PreviewResponse>({
    url,
    fetchImpl: ctx.fetchImpl,
    timeoutMs: ctx.timeoutMs,
    headers: ctx.defaultHeaders,
    getToken: ctx.getToken,
  });
}

export type HealthCheckResult =
  | {
      healthy: true;
      latestEventAt?: string | null;
      eventCount?: number;
    }
  | {
      healthy: false;
      reason: "api_error";
      error: string;
    }
  | {
      healthy: false;
      reason: "transport";
      error: ActivityWorkSDKError;
    };

export async function checkHealth(
  ctx: FetchPreviewContext & { healthTimeoutMs: number },
): Promise<HealthCheckResult> {
  const url = buildPreviewUrl(ctx.baseUrl, { limit: 1 });
  try {
    const body = await requestJson<PreviewResponse>({
      url,
      fetchImpl: ctx.fetchImpl,
      timeoutMs: ctx.healthTimeoutMs,
      headers: ctx.defaultHeaders,
      getToken: ctx.getToken,
    });
    if (body.ok === true) {
      return {
        healthy: true,
        latestEventAt:
          typeof body.latestEventAt === "string" || body.latestEventAt === null
            ? body.latestEventAt
            : undefined,
        eventCount:
          typeof body.eventCount === "number" ? body.eventCount : undefined,
      };
    }
    return { healthy: false, reason: "api_error", error: body.error };
  } catch (error) {
    if (error instanceof ActivityWorkSDKError) {
      return { healthy: false, reason: "transport", error };
    }
    return {
      healthy: false,
      reason: "transport",
      error: new ActivityWorkSDKError(
        error instanceof Error ? error.message : String(error),
        { cause: error },
      ),
    };
  }
}
