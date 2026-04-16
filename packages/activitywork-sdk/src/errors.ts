export class ActivityWorkSDKError extends Error {
  override readonly name: string = "ActivityWorkSDKError";
  readonly code: string = "sdk_error";

  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
  }
}

export class ActivityWorkHttpError extends ActivityWorkSDKError {
  override readonly name: string = "ActivityWorkHttpError";
  override readonly code: string = "http_error";
  readonly status: number;
  readonly statusText: string;
  readonly bodySnippet: string | null;

  constructor(init: {
    status: number;
    statusText: string;
    bodySnippet: string | null;
    message?: string;
    cause?: unknown;
  }) {
    super(
      init.message ??
        `ActivityWork HTTP ${init.status} ${init.statusText}`.trim(),
      { cause: init.cause },
    );
    this.status = init.status;
    this.statusText = init.statusText;
    this.bodySnippet = init.bodySnippet;
  }
}

export class ActivityWorkParseError extends ActivityWorkSDKError {
  override readonly name: string = "ActivityWorkParseError";
  override readonly code: string = "parse_error";

  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
  }
}

export class ActivityWorkTimeoutError extends ActivityWorkSDKError {
  override readonly name: string = "ActivityWorkTimeoutError";
  override readonly code: string = "timeout_error";

  constructor(message = "Request timed out", options?: { cause?: unknown }) {
    super(message, options);
  }
}

export function isAbortError(error: unknown): boolean {
  return (
    (error instanceof DOMException && error.name === "AbortError") ||
    (typeof error === "object" &&
      error !== null &&
      "name" in error &&
      (error as { name: string }).name === "AbortError")
  );
}
