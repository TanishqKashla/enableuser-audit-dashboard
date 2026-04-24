"use client";

import { useMemo } from "react";
import { Issue } from "../_lib/types";
import { computeScIssueCounts } from "../_lib/aggregate";
import {
  PRINCIPLE_ORDER,
  WCAG_21_AA,
  WcagCriterion,
  WcagPrinciple,
} from "../_lib/wcag-catalog";

interface Props {
  issues: Issue[];
}

export default function ConformanceGrid({ issues }: Props) {
  const scCounts = useMemo(() => computeScIssueCounts(issues), [issues]);

  const byPrinciple = useMemo(() => {
    const map: Record<WcagPrinciple, WcagCriterion[]> = {
      Perceivable: [],
      Operable: [],
      Understandable: [],
      Robust: [],
    };
    for (const sc of WCAG_21_AA) map[sc.principle].push(sc);
    return map;
  }, []);

  const totals = useMemo(() => {
    let withIssues = 0;
    let clean = 0;
    for (const sc of WCAG_21_AA) {
      if ((scCounts.get(sc.code) ?? 0) > 0) withIssues++;
      else clean++;
    }
    return { withIssues, clean, total: WCAG_21_AA.length };
  }, [scCounts]);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">Conformance summary</h2>
          <p className="mt-1 text-sm text-slate-600">
            WCAG 2.1 AA success criteria. Click a criterion to view its W3C
            documentation.
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <LegendDot color="bg-emerald-100 text-emerald-800 ring-emerald-300">
            No issues found <span className="ml-1 font-semibold">{totals.clean}</span>
          </LegendDot>
          <LegendDot color="bg-red-50 text-red-700 ring-red-300">
            Issues found <span className="ml-1 font-semibold">{totals.withIssues}</span>
          </LegendDot>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {PRINCIPLE_ORDER.map((principle, idx) => (
          <div key={principle}>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {idx + 1}. {principle}
            </h3>
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {byPrinciple[principle].map((sc) => {
                const count = scCounts.get(sc.code) ?? 0;
                const hasIssues = count > 0;
                return (
                  <li key={sc.code}>
                    <a
                      href={sc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={`${sc.code} ${sc.name} (Level ${sc.level})${
                        hasIssues ? ` — ${count} issue${count === 1 ? "" : "s"}` : ""
                      }`}
                      className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium ring-1 transition hover:opacity-80 ${
                        hasIssues
                          ? "bg-red-50 text-red-700 ring-red-200"
                          : "bg-emerald-50 text-emerald-800 ring-emerald-200"
                      }`}
                    >
                      <span aria-hidden>{hasIssues ? "✕" : "✓"}</span>
                      {sc.code}
                      {hasIssues && (
                        <span className="ml-0.5 rounded bg-red-100 px-1 text-[10px] font-semibold">
                          {count}
                        </span>
                      )}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

function LegendDot({
  color,
  children,
}: {
  color: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 ring-1 ${color}`}
    >
      {children}
    </span>
  );
}
