"use client";

import { useMemo, useState } from "react";
import { Issue, ParsedReport, SEVERITIES, Severity } from "../_lib/types";
import { extractSuccessCriteria } from "../_lib/parseCsv";
import { WCAG_21_AA } from "../_lib/wcag-catalog";
import IssueGroupRow, { IssueGroup } from "./IssueGroupRow";

type GroupMode = "type" | "wcag";

const SEVERITY_RANK: Record<Severity, number> = {
  critical: 4,
  serious: 3,
  moderate: 2,
  minor: 1,
};

interface Props {
  report: ParsedReport;
}

export default function AllIssuesTab({ report }: Props) {
  const { issues } = report;

  const [groupMode, setGroupMode] = useState<GroupMode>("type");
  const [severityFilter, setSeverityFilter] = useState<Severity | "all">("all");
  const [pageFilter, setPageFilter] = useState<string>("all");
  const [query, setQuery] = useState("");

  const hasActiveFilters =
    severityFilter !== "all" || pageFilter !== "all" || query.trim() !== "";

  function resetFilters() {
    setSeverityFilter("all");
    setPageFilter("all");
    setQuery("");
  }

  const pages = useMemo(() => {
    const s = new Set<string>();
    for (const i of issues) s.add(i.affectedPage);
    return Array.from(s).sort();
  }, [issues]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return issues.filter((i) => {
      if (severityFilter !== "all" && i.severity !== severityFilter) return false;
      if (pageFilter !== "all" && i.affectedPage !== pageFilter) return false;
      if (q) {
        const hay = `${i.issueName} ${i.issueType} ${i.component}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [issues, severityFilter, pageFilter, query]);

  const groups = useMemo(
    () =>
      groupMode === "type" ? groupByType(filtered) : groupByWcag(filtered),
    [filtered, groupMode],
  );

  const groupNoun =
    groupMode === "type"
      ? `issue type${groups.length === 1 ? "" : "s"}`
      : `WCAG criterion${groups.length === 1 ? "" : "s"}`;

  return (
    <section className="rounded-lg border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-4 py-3">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm text-slate-500">
            <span className="font-medium text-slate-900">{groups.length}</span>{" "}
            {groupNoun}
            <span className="mx-1.5 text-slate-300">·</span>
            <span className="font-medium text-slate-900">
              {filtered.length}
            </span>{" "}
            instance{filtered.length === 1 ? "" : "s"}
          </span>
          <div
            role="tablist"
            aria-label="Group by"
            className="ml-auto inline-flex rounded-md border border-slate-300 bg-white p-0.5 text-xs"
          >
            <button
              role="tab"
              aria-selected={groupMode === "type"}
              onClick={() => setGroupMode("type")}
              className={`rounded px-2.5 py-1 font-medium transition ${
                groupMode === "type"
                  ? "bg-brand text-white"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              By issue type
            </button>
            <button
              role="tab"
              aria-selected={groupMode === "wcag"}
              onClick={() => setGroupMode("wcag")}
              className={`rounded px-2.5 py-1 font-medium transition ${
                groupMode === "wcag"
                  ? "bg-brand text-white"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              By WCAG
            </button>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search issue name, type, component"
            className="h-9 min-w-[180px] flex-1 rounded-md border border-slate-300 px-2 text-sm focus:border-slate-500 focus:outline-none sm:h-8 sm:max-w-xs"
          />
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value as Severity | "all")}
            className="h-9 rounded-md border border-slate-300 px-2 text-sm sm:h-8"
          >
            <option value="all">All severities</option>
            {SEVERITIES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select
            value={pageFilter}
            onChange={(e) => setPageFilter(e.target.value)}
            className="h-9 rounded-md border border-slate-300 px-2 text-sm sm:h-8"
          >
            <option value="all">All pages</option>
            {pages.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="ml-auto h-9 rounded-md px-2 text-xs text-slate-600 underline hover:text-slate-900 sm:h-8"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {groups.length === 0 ? (
        <div className="px-4 py-10 text-center text-sm text-slate-500">
          No issues match the current filters.
        </div>
      ) : (
        <div>
          {groups.map((g) => (
            <IssueGroupRow key={g.key} group={g} />
          ))}
        </div>
      )}
    </section>
  );
}

function groupByType(issues: Issue[]): IssueGroup[] {
  const map = new Map<string, IssueGroup>();
  for (const i of issues) {
    const key = i.issueType || i.issueName;
    let g = map.get(key);
    if (!g) {
      g = {
        key,
        name: i.issueName,
        severity: i.severity,
        guidelines: [],
        instances: [],
      };
      map.set(key, g);
    }
    g.instances.push(i);
    for (const gl of i.guidelines) {
      if (!g.guidelines.includes(gl)) g.guidelines.push(gl);
    }
  }
  return Array.from(map.values()).sort(
    (a, b) => b.instances.length - a.instances.length,
  );
}

const WCAG_BY_CODE: Map<string, (typeof WCAG_21_AA)[number]> = new Map(
  WCAG_21_AA.map((c) => [c.code, c]),
);

function compareScCodes(a: string, b: string): number {
  const pa = a.split(".").map((n) => Number(n) || 0);
  const pb = b.split(".").map((n) => Number(n) || 0);
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i++) {
    const diff = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

const OTHER_KEY = "__other__";

function groupByWcag(issues: Issue[]): IssueGroup[] {
  const map = new Map<string, IssueGroup & { typeSet: Set<string> }>();

  function upsert(key: string, name: string, subtitle: string, issue: Issue) {
    let g = map.get(key);
    if (!g) {
      g = {
        key,
        name,
        subtitle,
        severity: issue.severity,
        guidelines: [],
        instances: [],
        typeSet: new Set<string>(),
      };
      map.set(key, g);
    }
    g.instances.push(issue);
    if (SEVERITY_RANK[issue.severity] > SEVERITY_RANK[g.severity]) {
      g.severity = issue.severity;
    }
    const typeLabel = issue.issueType || issue.issueName;
    if (typeLabel && !g.typeSet.has(typeLabel)) {
      g.typeSet.add(typeLabel);
      g.guidelines.push(typeLabel);
    }
  }

  for (const issue of issues) {
    const codes = extractSuccessCriteria(issue.guidelines);
    if (codes.length === 0) {
      upsert(OTHER_KEY, "Other / not mapped to WCAG 2.1 AA", "", issue);
      continue;
    }
    const seen = new Set<string>();
    for (const code of codes) {
      if (seen.has(code)) continue;
      seen.add(code);
      const meta = WCAG_BY_CODE.get(code);
      const name = meta ? meta.name : "Unknown criterion";
      const subtitle = meta
        ? `SC ${code} · Level ${meta.level} · ${meta.principle}`
        : `SC ${code}`;
      upsert(code, name, subtitle, issue);
    }
  }

  return Array.from(map.values())
    .map(({ typeSet: _typeSet, ...g }) => g)
    .sort((a, b) => {
      if (a.key === OTHER_KEY) return 1;
      if (b.key === OTHER_KEY) return -1;
      return compareScCodes(a.key, b.key);
    });
}
