"use client";

import {
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  PolarAngleAxis,
} from "recharts";
import { Issue, Severity, SEVERITIES } from "../_lib/types";
import {
  SeverityCounts,
  SEVERITY_WEIGHTS,
  computeDerivedScore,
} from "../_lib/aggregate";

interface Props {
  issues: Issue[];
  pagesAudited: number;
  severityCounts: SeverityCounts;
  hasUrlList: boolean;
}

const SEVERITY_COLOR: Record<Severity, string> = {
  critical: "#dc2626",
  serious: "#c026d3",
  moderate: "#d97706",
  minor: "#6b7280",
};

export default function AccessibilityScore({
  issues,
  pagesAudited,
  severityCounts,
  hasUrlList,
}: Props) {
  const score = computeDerivedScore(issues, pagesAudited);
  const scoreColor =
    score >= 90 ? "#542b7c" : score >= 70 ? "#d97706" : "#dc2626";

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Accessibility score</h2>
        <span
          className="text-xs text-slate-500"
          title="Derived from severity-weighted issues per audited page."
        >
          derived ⓘ
        </span>
      </div>
      <p className="mt-1 text-sm text-slate-600">
        {hasUrlList
          ? "Score is calculated from severity-weighted issues divided by audited pages."
          : "No URL list provided — score uses affected pages as the denominator."}
      </p>

      <div className="mt-4 grid grid-cols-1 items-center gap-6 md:grid-cols-2">
        <div className="relative h-48">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              innerRadius="80%"
              outerRadius="100%"
              startAngle={180}
              endAngle={0}
              data={[{ name: "score", value: score, fill: scoreColor }]}
            >
              <PolarAngleAxis
                type="number"
                domain={[0, 100]}
                angleAxisId={0}
                tick={false}
              />
              <RadialBar
                background={{ fill: "#e2e8f0" }}
                dataKey="value"
                cornerRadius={8}
              />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-end pb-4">
            <div className="text-4xl font-bold text-slate-900">{score}</div>
            <div className="text-xs uppercase tracking-wide text-slate-500">
              Score
            </div>
          </div>
        </div>

        <div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="pb-2 font-medium">Severity</th>
                <th className="pb-2 text-right font-medium">Issues</th>
                <th className="pb-2 text-right font-medium">Weight</th>
                <th className="pb-2 text-right font-medium">Impact</th>
              </tr>
            </thead>
            <tbody>
              {SEVERITIES.map((s) => {
                const n = severityCounts[s];
                const w = SEVERITY_WEIGHTS[s];
                const impact = pagesAudited > 0 ? (n * w) / pagesAudited : 0;
                return (
                  <tr key={s} className="border-t border-slate-100">
                    <td className="py-1.5 capitalize">
                      <span className="inline-flex items-center gap-1.5">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: SEVERITY_COLOR[s] }}
                        />
                        {s}
                      </span>
                    </td>
                    <td className="py-1.5 text-right tabular-nums">{n}</td>
                    <td className="py-1.5 text-right tabular-nums text-slate-500">
                      ×{w}
                    </td>
                    <td
                      className={`py-1.5 text-right tabular-nums ${
                        impact > 0 ? "text-red-600" : "text-slate-400"
                      }`}
                    >
                      {impact > 0 ? `−${impact.toFixed(2)}` : "0"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
