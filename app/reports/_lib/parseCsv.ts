import Papa from "papaparse";
import { Issue, SEVERITIES, Severity } from "./types";

const EXPECTED_HEADERS = [
  "Issue type",
  "Issue name",
  "Severity",
  "Component",
  "Behavior",
  "Issue description",
  "Affected page",
  "Guideline(s)",
  "HTML snippet",
  "CSS selector",
  "Needs review",
  "Needs Review Status",
  "Best practice",
  "How to fix this issue",
  "Issue link",
  "Timestamp",
  "Issue status",
] as const;

export interface CsvParseResult {
  issues: Issue[];
  warnings: string[];
}

export class CsvParseError extends Error {}

export function parseCsv(csvText: string): CsvParseResult {
  const result = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  if (result.errors.length > 0) {
    const first = result.errors[0];
    throw new CsvParseError(
      `CSV parse error on row ${first.row ?? "?"}: ${first.message}`,
    );
  }

  const actualHeaders = result.meta.fields ?? [];
  const missing = EXPECTED_HEADERS.filter((h) => !actualHeaders.includes(h));
  if (missing.length > 0) {
    throw new CsvParseError(
      `CSV is missing required columns: ${missing.join(", ")}`,
    );
  }

  const warnings: string[] = [];
  const issues: Issue[] = [];

  result.data.forEach((row, idx) => {
    const severityRaw = (row["Severity"] ?? "").trim().toLowerCase();
    if (!SEVERITIES.includes(severityRaw as Severity)) {
      warnings.push(
        `Row ${idx + 2}: unknown severity "${row["Severity"]}" — skipped.`,
      );
      return;
    }

    issues.push({
      issueType: row["Issue type"]?.trim() ?? "",
      issueName: row["Issue name"]?.trim() ?? "",
      severity: severityRaw as Severity,
      component: row["Component"]?.trim() ?? "",
      behavior: row["Behavior"]?.trim() ?? "",
      description: row["Issue description"]?.trim() ?? "",
      affectedPage: row["Affected page"]?.trim() ?? "",
      guidelines: splitGuidelines(row["Guideline(s)"] ?? ""),
      htmlSnippet: row["HTML snippet"] ?? "",
      cssSelector: row["CSS selector"] ?? "",
      needsReview: parseBool(row["Needs review"]),
      needsReviewStatus: row["Needs Review Status"]?.trim() ?? "",
      bestPractice: parseBool(row["Best practice"]),
      howToFix: row["How to fix this issue"] ?? "",
      issueLink: row["Issue link"]?.trim() ?? "",
      timestamp: row["Timestamp"]?.trim() ?? "",
      issueStatus: row["Issue status"]?.trim() ?? "",
    });
  });

  return { issues, warnings };
}

function splitGuidelines(raw: string): string[] {
  return raw
    .split(",")
    .map((s) => s.replace(/\s*\(experimental\)\s*$/i, "").trim())
    .filter(Boolean);
}

function parseBool(raw: string | undefined): boolean {
  return (raw ?? "").trim().toLowerCase() === "true";
}

export function extractSuccessCriteria(guidelines: string[]): string[] {
  const pattern = /^SC\s+(\d+\.\d+\.\d+)\b/i;
  const codes: string[] = [];
  for (const g of guidelines) {
    const m = g.match(pattern);
    if (m) codes.push(m[1]);
  }
  return codes;
}
