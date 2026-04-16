import { describe, expect, it, vi } from "vitest";
import {
  ActivityWorkHttpError,
  ActivityWorkTimeoutError,
  createActivityWorkClient,
} from "./index.js";

type FetchArgs = [RequestInfo, RequestInit?];

function firstFetchCall(mock: ReturnType<typeof vi.fn>): FetchArgs {
  const row = mock.mock.calls[0] as FetchArgs | undefined;
  expect(row).toBeDefined();
  return row!;
}

describe("ActivityWorkClient", () => {
  it("builds preview URL with query", async () => {
    const fetchMock = vi.fn(
      async (_input: RequestInfo, _init?: RequestInit): Promise<Response> =>
        new Response(JSON.stringify({ ok: true, eventCount: 2 }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
    );
    const client = createActivityWorkClient({
      baseUrl: "http://localhost:5601/",
      fetch: fetchMock as unknown as typeof fetch,
    });
    await client.preview({ limit: 5 });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const url = String(firstFetchCall(fetchMock)[0]);
    expect(url).toContain("/api/aw/preview");
    expect(url).toContain("limit=5");
  });

  it("returns healthy when preview ok", async () => {
    const fetchMock = vi.fn(
      async (_input: RequestInfo, _init?: RequestInit): Promise<Response> =>
        new Response(
          JSON.stringify({
            ok: true,
            eventCount: 1,
            latestEventAt: "2026-01-01T00:00:00Z",
          }),
          { status: 200 },
        ),
    );
    const client = createActivityWorkClient({
      fetch: fetchMock as unknown as typeof fetch,
    });
    const result = await client.checkHealth();
    expect(result).toEqual({
      healthy: true,
      eventCount: 1,
      latestEventAt: "2026-01-01T00:00:00Z",
    });
    const url = String(firstFetchCall(fetchMock)[0]);
    expect(url).toContain("limit=1");
  });

  it("returns api_error when ok false", async () => {
    const fetchMock = vi.fn(
      async (_input: RequestInfo, _init?: RequestInit): Promise<Response> =>
        new Response(JSON.stringify({ ok: false, error: "nope" }), { status: 200 }),
    );
    const client = createActivityWorkClient({
      fetch: fetchMock as unknown as typeof fetch,
    });
    const result = await client.checkHealth();
    expect(result).toEqual({
      healthy: false,
      reason: "api_error",
      error: "nope",
    });
  });

  it("maps HTTP errors", async () => {
    const fetchMock = vi.fn(
      async (_input: RequestInfo, _init?: RequestInit): Promise<Response> =>
        new Response("bad", { status: 500 }),
    );
    const client = createActivityWorkClient({
      fetch: fetchMock as unknown as typeof fetch,
    });
    await expect(client.preview()).rejects.toBeInstanceOf(ActivityWorkHttpError);
  });

  it("maps timeouts to ActivityWorkTimeoutError", async () => {
    const fetchMock = vi.fn((_input: RequestInfo, init?: RequestInit) => {
      return new Promise<Response>((_resolve, reject) => {
        const signal = init?.signal;
        if (!signal) {
          reject(new Error("expected AbortSignal"));
          return;
        }
        if (signal.aborted) {
          reject(new DOMException("Aborted", "AbortError"));
          return;
        }
        signal.addEventListener("abort", () => {
          reject(new DOMException("Aborted", "AbortError"));
        });
      });
    });
    const client = createActivityWorkClient({
      fetch: fetchMock as unknown as typeof fetch,
      timeoutMs: 20,
    });
    await expect(client.preview()).rejects.toBeInstanceOf(ActivityWorkTimeoutError);
  });

  it("injects authorization when getToken returns a value", async () => {
    const fetchMock = vi.fn(
      async (_input: RequestInfo, _init?: RequestInit): Promise<Response> =>
        new Response(JSON.stringify({ ok: true }), { status: 200 }),
    );
    const client = createActivityWorkClient({
      fetch: fetchMock as unknown as typeof fetch,
      getToken: () => Promise.resolve("secret"),
    });
    await client.preview();
    const init = firstFetchCall(fetchMock)[1];
    const headers = new Headers(init?.headers);
    expect(headers.get("authorization")).toBe("Bearer secret");
  });
});
