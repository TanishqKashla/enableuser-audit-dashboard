"use client";

import {
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  PolarAngleAxis,
} from "recharts";
import { Issue, Severity } from "../_lib/types";
import { computeScoreBreakdown } from "../_lib/aggregate";

interface Props {
  issues: Issue[];
  pagesAudited: number;
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
  hasUrlList,
}: Props) {
  const breakdown = computeScoreBreakdown(issues, pagesAudited);
  const { score, bySeverity } = breakdown;
  const scoreColor =
    score >= 90 ? "#542b7c" : score >= 70 ? "#d97706" : "#dc2626";

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Accessibility score</h2>
        <span
          className="text-xs text-slate-500"
          title="Per issue type: weight × ln(1 + instances) × (pagesAffected / pagesAudited). Weights: critical 4, serious 2, moderate 1, minor 0.5."
        >
          derived ⓘ
        </span>
      </div>
      <p className="mt-1 text-sm text-slate-600">
        {hasUrlList
          ? "An overall indicator of the site's accessibility health across audited pages."
          : "No URL list provided — pages audited is inferred from affected pages."}
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
                <th className="pb-2 text-right font-medium">Types</th>
                <th className="pb-2 text-right font-medium">Instances</th>
                <th className="pb-2 text-right font-medium">Impact</th>
              </tr>
            </thead>
            <tbody>
              {bySeverity.map((row) => (
                <tr key={row.severity} className="border-t border-slate-100">
                  <td className="py-1.5 capitalize">
                    <span className="inline-flex items-center gap-1.5">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: SEVERITY_COLOR[row.severity] }}
                      />
                      {row.severity}
                    </span>
                  </td>
                  <td className="py-1.5 text-right tabular-nums text-slate-500">
                    {row.issueTypes}
                  </td>
                  <td className="py-1.5 text-right tabular-nums">
                    {row.instances}
                  </td>
                  <td
                    className={`py-1.5 text-right tabular-nums ${
                      row.impact > 0 ? "text-red-600" : "text-slate-400"
                    }`}
                  >
                    {row.impact > 0 ? `−${row.impact.toFixed(2)}` : "0"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
