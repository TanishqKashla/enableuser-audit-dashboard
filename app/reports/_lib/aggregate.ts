import { Issue, Severity, SEVERITIES } from "./types";

export type SeverityCounts = Record<Severity, number>;

export function emptySeverityCounts(): SeverityCounts {
  return { critical: 0, serious: 0, moderate: 0, minor: 0 };
}

export function countBySeverity(issues: Issue[]): SeverityCounts {
  const counts = emptySeverityCounts();
  for (const i of issues) counts[i.severity]++;
  return counts;
}

export interface PageRollup {
  url: string;
  total: number;
  bySeverity: SeverityCounts;
}

export function rollupByPage(issues: Issue[]): PageRollup[] {
  const map = new Map<string, PageRollup>();
  for (const i of issues) {
    let entry = map.get(i.affectedPage);
    if (!entry) {
      entry = {
        url: i.affectedPage,
        total: 0,
        bySeverity: emptySeverityCounts(),
      };
      map.set(i.affectedPage, entry);
    }
    entry.total++;
    entry.bySeverity[i.severity]++;
  }
  return Array.from(map.values()).sort((a, b) => b.total - a.total);
}

export interface ComponentRollup {
  component: string;
  total: number;
}

export function rollupByComponent(issues: Issue[]): ComponentRollup[] {
  const map = new Map<string, number>();
  for (const i of issues) {
    map.set(i.component, (map.get(i.component) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .map(([component, total]) => ({ component, total }))
    .sort((a, b) => b.total - a.total);
}

export interface PageCoverage {
  totalAudited: number;
  withIssues: number;
  clean: number;
  hasUrlList: boolean;
}

export function computePageCoverage(
  issues: Issue[],
  auditedUrls: string[],
): PageCoverage {
  const affected = new Set(issues.map((i) => i.affectedPage));
  if (auditedUrls.length > 0) {
    const auditedSet = new Set(auditedUrls);
    for (const url of affected) auditedSet.add(url);
    const total = auditedSet.size;
    return {
      totalAudited: total,
      withIssues: affected.size,
      clean: total - affected.size,
      hasUrlList: true,
    };
  }
  return {
    totalAudited: affected.size,
    withIssues: affected.size,
    clean: 0,
    hasUrlList: false,
  };
}

export const SEVERITY_WEIGHTS: Record<Severity, number> = {
  critical: 4,
  serious: 2,
  moderate: 1,
  minor: 0.5,
};

export interface SeverityBreakdown {
  severity: Severity;
  issueTypes: number;
  instances: number;
  impact: number;
}

export interface ScoreBreakdown {
  score: number;
  penalty: number;
  bySeverity: SeverityBreakdown[];
}

// Score formula (per issue type):
//   penalty = weight × ln(1 + instanceCount) × (pagesAffected / pagesAudited)
//   score   = 100 − Σ penalty_per_type
// Severity weights are non-linear (8/4/2/1) so a few critical defects outweigh
// many moderate ones. Grouping by issue type rewards fix-by-pattern (one
// alt-text bug on 40 images ≠ 40 distinct critical defects). ln smooths
// repetition with diminishing returns; linear page coverage means a bug on
// 10% of pages costs 10% of the uncapped per-type penalty.
export function computeScoreBreakdown(
  issues: Issue[],
  pagesAudited: number,
): ScoreBreakdown {
  const empty: SeverityBreakdown[] = SEVERITIES.map((s) => ({
    severity: s,
    issueTypes: 0,
    instances: 0,
    impact: 0,
  }));

  if (pagesAudited <= 0 || issues.length === 0) {
    return { score: 100, penalty: 0, bySeverity: empty };
  }

  const groups = new Map<
    string,
    { severity: Severity; count: number; pages: Set<string> }
  >();
  for (const i of issues) {
    const key = i.issueType || i.issueName;
    let g = groups.get(key);
    if (!g) {
      g = { severity: i.severity, count: 0, pages: new Set() };
      groups.set(key, g);
    }
    g.count++;
    g.pages.add(i.affectedPage);
  }

  const agg: Record<Severity, SeverityBreakdown> = {
    critical: { severity: "critical", issueTypes: 0, instances: 0, impact: 0 },
    serious: { severity: "serious", issueTypes: 0, instances: 0, impact: 0 },
    moderate: { severity: "moderate", issueTypes: 0, instances: 0, impact: 0 },
    minor: { severity: "minor", issueTypes: 0, instances: 0, impact: 0 },
  };

  let penalty = 0;
  for (const g of groups.values()) {
    const weight = SEVERITY_WEIGHTS[g.severity];
    const coverage = Math.min(1, g.pages.size / pagesAudited);
    const p = weight * Math.log(1 + g.count) * coverage;
    const bucket = agg[g.severity];
    bucket.issueTypes++;
    bucket.instances += g.count;
    bucket.impact += p;
    penalty += p;
  }

  const score = Math.max(0, Math.min(100, Math.round(100 - penalty)));
  return {
    score,
    penalty,
    bySeverity: SEVERITIES.map((s) => agg[s]),
  };
}

export function computeDerivedScore(
  issues: Issue[],
  pagesAudited: number,
): number {
  return computeScoreBreakdown(issues, pagesAudited).score;
}

export { SEVERITIES };

export function extractSuccessCriteriaCodes(raw: string[]): string[] {
  const pattern = /^SC\s+(\d+\.\d+\.\d+)\b/i;
  const codes: string[] = [];
  for (const g of raw) {
    const m = g.match(pattern);
    if (m) codes.push(m[1]);
  }
  return codes;
}

export function computeScIssueCounts(issues: Issue[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const i of issues) {
    const codes = extractSuccessCriteriaCodes(i.guidelines);
    for (const code of codes) {
      counts.set(code, (counts.get(code) ?? 0) + 1);
    }
  }
  return counts;
}
