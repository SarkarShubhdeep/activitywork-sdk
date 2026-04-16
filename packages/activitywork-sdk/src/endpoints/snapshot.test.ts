import { describe, expect, it, vi } from "vitest";
import { createActivityWorkClient } from "../client.js";
import { getSnapshotUrl } from "./snapshot.js";

type FetchArgs = [RequestInfo, RequestInit?];

function firstFetchCall(mock: ReturnType<typeof vi.fn>): FetchArgs {
  const row = mock.mock.calls[0] as FetchArgs | undefined;
  expect(row).toBeDefined();
  return row!;
}

describe("snapshot", () => {
  it("getSnapshotUrl encodes range and optional params", () => {
    const href = getSnapshotUrl("http://localhost:5601", {
      range: "1h",
      limit: 50,
      bucketId: "b1",
    });
    const url = new URL(href);
    expect(url.pathname).toBe("/api/aw/snapshot");
    expect(url.searchParams.get("range")).toBe("1h");
    expect(url.searchParams.get("limit")).toBe("50");
    expect(url.searchParams.get("bucketId")).toBe("b1");
  });

  it("fetches snapshot JSON", async () => {
    const fetchMock = vi.fn(
      async (_input: RequestInfo, _init?: RequestInit): Promise<Response> =>
        new Response(
          JSON.stringify({
            ok: true,
            range: "1h",
            events: [],
            truncated: false,
          }),
          { status: 200 },
        ),
    );
    const client = createActivityWorkClient({
      fetch: fetchMock as unknown as typeof fetch,
    });
    const body = await client.snapshot({ range: "30m" });
    expect(body.ok).toBe(true);
    if (body.ok) {
      expect(body.range).toBe("1h");
    }
    const url = String(firstFetchCall(fetchMock)[0]);
    expect(url).toContain("range=30m");
  });
});
