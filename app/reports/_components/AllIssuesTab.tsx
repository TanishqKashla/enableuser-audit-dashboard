"use client";

import { useMemo, useState } from "react";
import { Issue, ParsedReport, SEVERITIES, Severity } from "../_lib/types";
import IssueGroupRow, { IssueGroup } from "./IssueGroupRow";

interface Props {
  report: ParsedReport;
}

export default function AllIssuesTab({ report }: Props) {
  const { issues } = report;

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

  const groups = useMemo(() => groupIssues(filtered), [filtered]);

  return (
    <section className="rounded-lg border border-slate-200 bg-white">
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 px-4 py-3">
        <h2 className="text-base font-semibold">All issues</h2>
        <span className="text-sm text-slate-500">
          {groups.length} issue type{groups.length === 1 ? "" : "s"} ·{" "}
          {filtered.length} instance{filtered.length === 1 ? "" : "s"}
        </span>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search issue name, type, component"
            className="h-8 rounded-md border border-slate-300 px-2 text-sm focus:border-slate-500 focus:outline-none"
          />
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value as Severity | "all")}
            className="h-8 rounded-md border border-slate-300 px-2 text-sm"
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
            className="h-8 rounded-md border border-slate-300 px-2 text-sm"
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
              className="h-8 rounded-md px-2 text-xs text-slate-600 underline hover:text-slate-900"
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

function groupIssues(issues: Issue[]): IssueGroup[] {
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
