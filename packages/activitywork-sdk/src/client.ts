import {
  checkHealth,
  fetchPreview,
  type HealthCheckResult,
} from "./endpoints/preview.js";
import { fetchSnapshot } from "./endpoints/snapshot.js";
import { normalizeBaseUrl } from "./internal/url.js";
import type { PreviewQuery, PreviewResponse } from "./types/preview.js";
import type { SnapshotQuery, SnapshotResponse } from "./types/snapshot.js";

export type ActivityWorkClientConfig = {
  /** ActivityWork origin, default `http://localhost:5601` (no trailing slash required). */
  baseUrl?: string;
  /** Injectable `fetch` (tests, undici, Meteor). Defaults to global `fetch`. */
  fetch?: typeof globalThis.fetch;
  /** Default timeout for preview/snapshot (ms). Default 12_000. */
  timeoutMs?: number;
  /** Timeout for {@link ActivityWorkClient.checkHealth} (ms). Default 3_000. */
  healthTimeoutMs?: number;
  /** Extra headers on every request (e.g. correlation ids). */
  defaultHeaders?: HeadersInit;
  /** Optional bearer token provider for future authenticated deployments. */
  getToken?: () => string | Promise<string>;
};

const DEFAULT_TIMEOUT_MS = 12_000;
const DEFAULT_HEALTH_TIMEOUT_MS = 3_000;

export class ActivityWorkClient {
  readonly baseUrl: string;
  private readonly fetchImpl: typeof fetch;
  private readonly timeoutMs: number;
  private readonly healthTimeoutMs: number;
  private readonly defaultHeaders?: HeadersInit;
  private readonly getToken?: () => string | Promise<string>;

  constructor(config: ActivityWorkClientConfig = {}) {
    this.baseUrl = normalizeBaseUrl(config.baseUrl);
    this.fetchImpl = config.fetch ?? globalThis.fetch.bind(globalThis);
    this.timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.healthTimeoutMs = config.healthTimeoutMs ?? DEFAULT_HEALTH_TIMEOUT_MS;
    this.defaultHeaders = config.defaultHeaders;
    this.getToken = config.getToken;
  }

  private ctx() {
    return {
      baseUrl: this.baseUrl,
      fetchImpl: this.fetchImpl,
      timeoutMs: this.timeoutMs,
      defaultHeaders: this.defaultHeaders,
      getToken: this.getToken,
    };
  }

  /** `GET /api/aw/preview` */
  preview(query?: PreviewQuery): Promise<PreviewResponse> {
    return fetchPreview(this.ctx(), query);
  }

  /** Liveness via `GET /api/aw/preview?limit=1` with {@link ActivityWorkClientConfig.healthTimeoutMs}. */
  checkHealth(): Promise<HealthCheckResult> {
    return checkHealth({
      ...this.ctx(),
      healthTimeoutMs: this.healthTimeoutMs,
    });
  }

  /** `GET /api/aw/snapshot` */
  snapshot(query: SnapshotQuery): Promise<SnapshotResponse> {
    return fetchSnapshot(this.ctx(), query);
  }
}

export function createActivityWorkClient(
  config?: ActivityWorkClientConfig,
): ActivityWorkClient {
  return new ActivityWorkClient(config);
}
