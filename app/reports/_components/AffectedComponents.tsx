"use client";

import { useMemo, useState } from "react";
import { Issue } from "../_lib/types";
import { ComponentRollup, rollupByComponent } from "../_lib/aggregate";

interface Props {
  issues: Issue[];
}

export default function AffectedComponents({ issues }: Props) {
  const rollups: ComponentRollup[] = useMemo(
    () => rollupByComponent(issues),
    [issues],
  );
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? rollups : rollups.slice(0, 10);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6">
      <h2 className="text-base font-semibold">Affected components</h2>
      <div className="mt-1 text-sm text-slate-600">
        Total: <span className="font-medium text-slate-900">{rollups.length}</span>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="pb-2 font-medium">#</th>
              <th className="pb-2 font-medium">Component</th>
              <th className="pb-2 text-right font-medium">Issues</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((r, idx) => (
              <tr key={r.component} className="border-t border-slate-100">
                <td className="py-1.5 align-top text-slate-500">{idx + 1}</td>
                <td className="py-1.5 align-top">
                  <span className="break-all font-mono text-xs text-slate-800">
                    {r.component}
                  </span>
                </td>
                <td className="py-1.5 text-right align-top font-medium tabular-nums">
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
                  No components.
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
    </section>
  );
}
