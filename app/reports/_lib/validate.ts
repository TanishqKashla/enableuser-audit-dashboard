import { Issue } from "./types";

export interface MatchValidation {
  errors: string[];
  warnings: string[];
  csvDomains: string[];
  urlListDomains: string[];
}

function extractDomain(raw: string): string | null {
  try {
    const host = new URL(raw).hostname.toLowerCase();
    return host.startsWith("www.") ? host.slice(4) : host;
  } catch {
    return null;
  }
}

function uniqueDomains(urls: string[]): string[] {
  const set = new Set<string>();
  for (const u of urls) {
    const d = extractDomain(u);
    if (d) set.add(d);
  }
  return [...set].sort();
}

export function validateCsvUrlMatch(
  issues: Issue[],
  auditedUrls: string[],
): MatchValidation {
  const csvDomains = uniqueDomains(issues.map((i) => i.affectedPage));
  const urlListDomains = uniqueDomains(auditedUrls);

  const errors: string[] = [];
  const warnings: string[] = [];

  if (csvDomains.length > 0 && urlListDomains.length > 0) {
    const listSet = new Set(urlListDomains);
    const overlap = csvDomains.filter((d) => listSet.has(d));
    if (overlap.length === 0) {
      errors.push(
        `Domain mismatch. The CSV reports issues for [${csvDomains.join(
          ", ",
        )}], but the URL list covers [${urlListDomains.join(
          ", ",
        )}]. These look like different sites — double-check the files.`,
      );
    } else {
      const csvOnly = csvDomains.filter((d) => !listSet.has(d));
      if (csvOnly.length > 0) {
        warnings.push(
          `CSV contains issues for ${csvOnly.length} domain${
            csvOnly.length === 1 ? "" : "s"
          } not in the URL list: ${csvOnly.join(", ")}.`,
        );
      }
    }
  }

  if (auditedUrls.length > 0 && issues.length > 0) {
    const urlSet = new Set(auditedUrls);
    const csvPageSet = new Set(issues.map((i) => i.affectedPage));
    const missingFromList = [...csvPageSet].filter((p) => !urlSet.has(p));
    if (missingFromList.length > 0 && missingFromList.length <= csvPageSet.size) {
      warnings.push(
        `${missingFromList.length} page${
          missingFromList.length === 1 ? "" : "s"
        } with issues ${
          missingFromList.length === 1 ? "is" : "are"
        } not in the URL list. The "pages audited" total may undercount.`,
      );
    }
  }

  return { errors, warnings, csvDomains, urlListDomains };
}
