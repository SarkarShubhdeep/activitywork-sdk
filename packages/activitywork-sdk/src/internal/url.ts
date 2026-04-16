const DEFAULT_BASE = "http://localhost:5601";

export function normalizeBaseUrl(baseUrl?: string): string {
  const raw = (baseUrl ?? DEFAULT_BASE).trim();
  return raw.replace(/\/+$/, "");
}

export function buildUrl(base: string, path: string, searchParams?: URLSearchParams): string {
  const url = new URL(path.startsWith("/") ? path : `/${path}`, `${base}/`);
  if (searchParams && [...searchParams.keys()].length > 0) {
    url.search = searchParams.toString();
  }
  return url.toString();
}
