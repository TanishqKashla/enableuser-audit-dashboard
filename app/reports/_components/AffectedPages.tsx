"use client";

import { useMemo, useState } from "react";
import { Issue } from "../_lib/types";
import {
  PageCoverage,
  PageRollup,
  computePageCoverage,
  rollupByPage,
} from "../_lib/aggregate";

interface Props {
  issues: Issue[];
  auditedUrls: string[];
}

export default function AffectedPages({ issues, auditedUrls }: Props) {
  const rollups: PageRollup[] = useMemo(() => rollupByPage(issues), [issues]);
  const coverage: PageCoverage = useMemo(
    () => computePageCoverage(issues, auditedUrls),
    [issues, auditedUrls],
  );

  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? rollups : rollups.slice(0, 10);

  const cleanPages = useMemo(() => {
    if (!coverage.hasUrlList) return [];
    const affected = new Set(rollups.map((r) => r.url));
    return auditedUrls.filter((u) => !affected.has(u));
  }, [auditedUrls, rollups, coverage.hasUrlList]);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Affected pages</h2>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <CoverageStat label="Total audited" value={coverage.totalAudited} />
        <CoverageStat
          label="With issues"
          value={coverage.withIssues}
          tone="warn"
        />
        <CoverageStat
          label="Clean"
          value={coverage.hasUrlList ? coverage.clean : "—"}
          tone="ok"
        />
      </div>
      {!coverage.hasUrlList && (
        <p className="mt-2 text-xs text-slate-500">
          Upload the audited URL list to see clean-page coverage.
        </p>
      )}

      <div className="mt-5 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="pb-2 font-medium">#</th>
              <th className="pb-2 font-medium">Page</th>
              <th className="pb-2 text-right font-medium">Issues</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((r, idx) => (
              <tr key={r.url} className="border-t border-slate-100">
                <td className="py-1.5 text-slate-500">{idx + 1}</td>
                <td className="py-1.5">
                  <span className="break-all text-slate-800">{r.url}</span>
                </td>
                <td className="py-1.5 text-right font-medium tabular-nums">
                  {r.total}
                </td>
              </tr>
            ))}
            {rollups.length === 0 && (
              <tr>
                <td
                  colSpan={3}
                  className="py-6 text-center text-sm text-slate-500"
                >
                  No pages with issues.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {rollups.length > 10 && (
          <button
            onClick={() => setShowAll((v) => !v)}
            className="mt-2 text-xs text-slate-600 underline hover:text-slate-900"
          >
            {showAll ? "Show top 10" : `Show all ${rollups.length}`}
          </button>
        )}
      </div>

      {cleanPages.length > 0 && (
        <details className="mt-4 text-sm">
          <summary className="cursor-pointer text-slate-700 hover:text-slate-900">
            Clean pages ({cleanPages.length})
          </summary>
          <ul className="mt-2 space-y-1 pl-4 text-xs text-slate-600">
            {cleanPages.map((u) => (
              <li key={u} className="break-all">
                {u}
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}

function CoverageStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number | string;
  tone?: "ok" | "warn";
}) {
  const color =
    tone === "ok"
      ? "text-emerald-700"
      : tone === "warn"
        ? "text-amber-700"
        : "text-slate-900";
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
      <div className="text-xs uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div className={`mt-0.5 text-xl font-semibold ${color}`}>{value}</div>
    </div>
  );
}
