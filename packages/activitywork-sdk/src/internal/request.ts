import {
  ActivityWorkHttpError,
  ActivityWorkParseError,
  ActivityWorkTimeoutError,
  isAbortError,
} from "../errors.js";

export type RequestJsonInit = {
  url: string;
  method?: string;
  fetchImpl: typeof fetch;
  timeoutMs: number;
  headers?: HeadersInit;
  getToken?: () => string | Promise<string>;
};

export async function requestJson<T>(init: RequestJsonInit): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => {
    controller.abort();
  }, init.timeoutMs);

  const headers = new Headers(init.headers);
  if (init.getToken) {
    const token = await init.getToken();
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
  }

  try {
    const response = await init.fetchImpl(init.url, {
      method: init.method ?? "GET",
      headers,
      signal: controller.signal,
    });

    const text = await response.text();
    const bodySnippet = text.length > 2000 ? `${text.slice(0, 2000)}…` : text;

    if (!response.ok) {
      throw new ActivityWorkHttpError({
        status: response.status,
        statusText: response.statusText,
        bodySnippet: bodySnippet || null,
      });
    }

    if (!text) {
      throw new ActivityWorkParseError("Empty response body");
    }

    try {
      return JSON.parse(text) as T;
    } catch (cause) {
      throw new ActivityWorkParseError("Failed to parse JSON response", {
        cause,
      });
    }
  } catch (error) {
    if (isAbortError(error)) {
      throw new ActivityWorkTimeoutError(undefined, { cause: error });
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}
