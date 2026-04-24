export interface UrlParseResult {
  urls: string[];
  invalid: string[];
}

export function parseUrls(raw: string): UrlParseResult {
  const urls: string[] = [];
  const invalid: string[] = [];
  const seen = new Set<string>();

  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (!isProbablyUrl(trimmed)) {
      invalid.push(trimmed);
      continue;
    }
    if (seen.has(trimmed)) continue;
    seen.add(trimmed);
    urls.push(trimmed);
  }

  return { urls, invalid };
}

function isProbablyUrl(s: string): boolean {
  try {
    const u = new URL(s);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}
