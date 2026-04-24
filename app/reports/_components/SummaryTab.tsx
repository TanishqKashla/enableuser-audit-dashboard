"use client";

import { useMemo } from "react";
import { ParsedReport, SEVERITIES, Severity } from "../_lib/types";
import {
  countBySeverity,
  computePageCoverage,
  SeverityCounts,
  PageCoverage,
} from "../_lib/aggregate";
import AccessibilityScore from "./AccessibilityScore";
import IssueSummary from "./IssueSummary";
import AffectedPages from "./AffectedPages";
import AffectedComponents from "./AffectedComponents";
import ConformanceGrid from "./ConformanceGrid";

interface Props {
  report: ParsedReport;
}

const SEVERITY_STYLES: Record<
  Severity,
  { bar: string; dot: string; text: string; faint: string }
> = {
  critical: {
    bar: "bg-red-600",
    dot: "bg-red-600",
    text: "text-red-700",
    faint: "bg-red-50",
  },
  serious: {
    bar: "bg-fuchsia-600",
    dot: "bg-fuchsia-600",
    text: "text-fuchsia-700",
    faint: "bg-fuchsia-50",
  },
  moderate: {
    bar: "bg-amber-500",
    dot: "bg-amber-500",
    text: "text-amber-700",
    faint: "bg-amber-50",
  },
  minor: {
    bar: "bg-slate-400",
    dot: "bg-slate-400",
    text: "text-slate-600",
    faint: "bg-slate-100",
  },
};

export default function SummaryTab({ report }: Props) {
  const { issues, auditedUrls } = report;

  const severityCounts = useMemo(() => countBySeverity(issues), [issues]);
  const coverage = useMemo(
    () => computePageCoverage(issues, auditedUrls),
    [issues, auditedUrls],
  );

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <TotalIssuesCard
          total={issues.length}
          affectedPages={coverage.withIssues}
          severityCounts={severityCounts}
        />
        <PagesAuditedCard coverage={coverage} />
      </section>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {SEVERITIES.map((s) => (
          <SeverityCard
            key={s}
            severity={s}
            count={severityCounts[s]}
            total={issues.length}
          />
        ))}
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <AccessibilityScore
          issues={issues}
          pagesAudited={coverage.totalAudited}
          severityCounts={severityCounts}
          hasUrlList={coverage.hasUrlList}
        />
        <IssueSummary severityCounts={severityCounts} total={issues.length} />
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <AffectedPages issues={issues} auditedUrls={auditedUrls} />
        <AffectedComponents issues={issues} />
      </section>

      <ConformanceGrid issues={issues} />
    </div>
  );
}

function TotalIssuesCard({
  total,
  affectedPages,
  severityCounts,
}: {
  total: number;
  affectedPages: number;
  severityCounts: SeverityCounts;
}) {
  const segments = SEVERITIES.map((s) => ({
    key: s,
    width: total > 0 ? (severityCounts[s] / total) * 100 : 0,
    bar: SEVERITY_STYLES[s].bar,
  })).filter((seg) => seg.width > 0);

  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br from-brand-50 via-white to-white p-6 md:col-span-2">
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full opacity-10"
        style={{ background: "#542b7c" }}
      />
      <div className="relative flex items-start justify-between gap-6">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.15em] text-brand">
            Total issues found
          </div>
          <div className="mt-3 flex items-baseline gap-3">
            <span className="text-5xl font-bold tracking-tight text-slate-900">
              {total}
            </span>
            {total > 0 && affectedPages > 0 && (
              <span className="text-sm text-slate-600">
                across {affectedPages} page{affectedPages === 1 ? "" : "s"}
              </span>
            )}
          </div>
        </div>
      </div>

      {total > 0 && (
        <div className="relative mt-5">
          <div className="flex h-2 overflow-hidden rounded-full bg-slate-100">
            {segments.map((seg) => (
              <div
                key={seg.key}
                className={seg.bar}
                style={{ width: `${seg.width}%` }}
              />
            ))}
          </div>
          <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
            {SEVERITIES.filter((s) => severityCounts[s] > 0).map((s) => (
              <span key={s} className="inline-flex items-center gap-1.5">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${SEVERITY_STYLES[s].dot}`}
                />
                <span className="capitalize">{s}</span>
                <span className="font-medium text-slate-900">
                  {severityCounts[s]}
                </span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PagesAuditedCard({ coverage }: { coverage: PageCoverage }) {
  const { totalAudited, withIssues, clean, hasUrlList } = coverage;
  const withPct = totalAudited > 0 ? (withIssues / totalAudited) * 100 : 0;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <div className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
        Pages audited
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-5xl font-bold tracking-tight text-slate-900">
          {hasUrlList ? totalAudited : withIssues}
        </span>
        {!hasUrlList && (
          <span
            className="text-xs text-slate-500"
            title="Provide the audited URL list for exact coverage."
          >
            (from issues)
          </span>
        )}
      </div>

      {hasUrlList && totalAudited > 0 ? (
        <div className="mt-5">
          <div className="flex h-2 overflow-hidden rounded-full bg-emerald-100">
            <div
              className="bg-amber-500"
              style={{ width: `${withPct}%` }}
            />
          </div>
          <div className="mt-2.5 flex justify-between text-xs">
            <span className="inline-flex items-center gap-1.5 text-amber-700">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              <span>With issues</span>
              <span className="font-medium">{withIssues}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>Clean</span>
              <span className="font-medium">{clean}</span>
            </span>
          </div>
        </div>
      ) : (
        <p className="mt-5 text-xs text-slate-500">
          Upload the audited URL list for accurate coverage.
        </p>
      )}
    </div>
  );
}

function SeverityCard({
  severity,
  count,
  total,
}: {
  severity: Severity;
  count: number;
  total: number;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  const style = SEVERITY_STYLES[severity];

  return (
    <div className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4 transition hover:shadow-sm">
      <span
        aria-hidden
        className={`absolute inset-y-0 left-0 w-1 ${style.bar}`}
      />
      <div className="flex items-center justify-between gap-2">
        <div className="inline-flex items-center gap-1.5">
          <span className={`h-2 w-2 rounded-full ${style.dot}`} />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            {severity}
          </span>
        </div>
        {count > 0 && (
          <span
            className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${style.faint} ${style.text}`}
          >
            {pct}%
          </span>
        )}
      </div>
      <div className="mt-2 flex items-baseline gap-1.5">
        <span className="text-3xl font-bold tabular-nums text-slate-900">
          {count}
        </span>
      </div>
      <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full transition-all ${style.bar}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
