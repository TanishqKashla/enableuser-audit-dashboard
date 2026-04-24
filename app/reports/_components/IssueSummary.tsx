"use client";

import { useRef, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { Severity, SEVERITIES } from "../_lib/types";
import { SeverityCounts } from "../_lib/aggregate";

interface Props {
  severityCounts: SeverityCounts;
  total: number;
}

const SEVERITY_COLOR: Record<Severity, string> = {
  critical: "#dc2626",
  serious: "#c026d3",
  moderate: "#d97706",
  minor: "#6b7280",
};

const SEVERITY_DESCRIPTION: Record<Severity, string> = {
  critical: "Blocks users from completing core tasks.",
  serious: "Major barrier; workaround may exist.",
  moderate: "Degrades experience; doesn't block.",
  minor: "Minor polish, low user impact.",
};

export default function IssueSummary({ severityCounts, total }: Props) {
  const data = SEVERITIES.filter((s) => severityCounts[s] > 0).map((s) => ({
    name: s,
    value: severityCounts[s],
  }));

  const chartRef = useRef<HTMLDivElement | null>(null);
  const [hovered, setHovered] = useState<Severity | null>(null);
  const [cursor, setCursor] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = chartRef.current?.getBoundingClientRect();
    if (!rect) return;
    setCursor({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }

  const hoveredValue = hovered ? severityCounts[hovered] : 0;
  const hoveredPct =
    hovered && total > 0 ? Math.round((hoveredValue / total) * 100) : 0;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Issue summary</h2>
      </div>
      <p className="mt-1 text-sm text-slate-600">
        A higher severity level indicates a more serious impact on users.
      </p>

      <div className="mt-4 grid grid-cols-1 items-center gap-6 md:grid-cols-2">
        <div
          ref={chartRef}
          onMouseMove={handleMouseMove}
          className="relative h-48"
        >
          {total > 0 ? (
            <>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    innerRadius="65%"
                    outerRadius="95%"
                    paddingAngle={1}
                    stroke="none"
                    isAnimationActive={false}
                    onMouseEnter={(entry: { name?: Severity }) => {
                      if (entry?.name) setHovered(entry.name);
                    }}
                    onMouseLeave={() => setHovered(null)}
                  >
                    {data.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={SEVERITY_COLOR[entry.name as Severity]}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-3xl font-bold text-slate-900">{total}</div>
                <div className="text-xs uppercase tracking-wide text-slate-500">
                  Issues
                </div>
              </div>
              {hovered && (
                <div
                  className="pointer-events-none absolute z-20 w-44 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] shadow-lg"
                  style={{
                    left: cursor.x,
                    top: cursor.y,
                    transform: "translate(-50%, calc(-100% - 10px))",
                  }}
                >
                  <div className="flex items-center gap-1.5">
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: SEVERITY_COLOR[hovered] }}
                    />
                    <span className="font-semibold capitalize text-slate-900">
                      {hovered}
                    </span>
                    <span className="ml-auto tabular-nums text-slate-500">
                      {hoveredValue} · {hoveredPct}%
                    </span>
                  </div>
                  <p className="mt-0.5 leading-snug text-slate-600">
                    {SEVERITY_DESCRIPTION[hovered]}
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-slate-500">
              No issues found.
            </div>
          )}
        </div>

        <div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="pb-2 font-medium">Severity</th>
                <th className="pb-2 text-right font-medium">Count</th>
              </tr>
            </thead>
            <tbody>
              {SEVERITIES.map((s) => (
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
                  <td className="py-1.5 text-right tabular-nums">
                    {severityCounts[s]}
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
