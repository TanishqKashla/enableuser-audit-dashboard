"use client";

import { useState } from "react";
import { Issue, Severity } from "../_lib/types";
import IssueDetail from "./IssueDetail";

export interface IssueGroup {
  key: string;
  name: string;
  severity: Severity;
  guidelines: string[];
  instances: Issue[];
  subtitle?: string;
}

interface Props {
  group: IssueGroup;
}

const SEVERITY_DOT: Record<Severity, string> = {
  critical: "bg-severity-critical",
  serious: "bg-severity-serious",
  moderate: "bg-severity-moderate",
  minor: "bg-severity-minor",
};

export default function IssueGroupRow({ group }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  function toggle() {
    setExpanded((v) => {
      if (v) setSelectedIdx(null);
      return !v;
    });
  }

  return (
    <div className="border-b border-slate-100 last:border-b-0">
      <button
        onClick={toggle}
        aria-expanded={expanded}
        className="flex w-full items-center gap-2 px-3 py-3 text-left hover:bg-slate-50 sm:gap-3 sm:px-4"
      >
        <span className="text-slate-400">
          <svg
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden
            className={`transition-transform ${expanded ? "rotate-90" : ""}`}
          >
            <path
              d="M6 4l4 4-4 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${severityPillClass(
            group.severity,
          )}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${SEVERITY_DOT[group.severity]}`} />
          {group.severity}
        </span>
        <span className="flex-1 min-w-0">
          <span className="block break-words text-sm font-medium text-slate-900 sm:text-base">
            {group.name}
          </span>
          {(group.subtitle ?? group.key) && (
            <span className="block break-words font-mono text-[11px] text-slate-500 sm:text-xs">
              {group.subtitle ?? group.key}
            </span>
          )}
        </span>
        {group.guidelines.length > 0 && (
          <span className="hidden items-center gap-1 md:inline-flex">
            {group.guidelines.slice(0, 3).map((g) => {
              const label = g.replace(/\s*\(experimental\)\s*$/i, "").trim();
              return (
                <span
                  key={g}
                  className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-600"
                >
                  {label}
                </span>
              );
            })}
          </span>
        )}
        <span className="rounded-full bg-brand px-2.5 py-0.5 text-xs font-semibold text-white">
          {group.instances.length}
        </span>
      </button>

      {expanded && (
        <div className="border-t border-slate-100 bg-slate-50/50 px-3 py-4 sm:px-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
            <div
              className={`${
                selectedIdx !== null ? "lg:col-span-2" : "lg:col-span-5"
              }`}
            >
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Instances ({group.instances.length})
              </div>
              <ul className="divide-y divide-slate-200 overflow-hidden rounded-md border border-slate-200 bg-white">
                {group.instances.map((inst, idx) => {
                  const selected = selectedIdx === idx;
                  return (
                    <li key={idx}>
                      <button
                        onClick={() =>
                          setSelectedIdx(selected ? null : idx)
                        }
                        className={`flex w-full items-start gap-3 px-3 py-2 text-left hover:bg-slate-50 ${
                          selected ? "bg-blue-50 hover:bg-blue-50" : ""
                        }`}
                      >
                        <span className="mt-0.5 shrink-0 text-xs text-slate-400">
                          {idx + 1}.
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block break-all text-sm text-slate-800">
                            {inst.affectedPage}
                          </span>
                          <span className="mt-0.5 block break-all font-mono text-[11px] text-slate-500">
                            {inst.component}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            {selectedIdx !== null && (
              <div className="lg:col-span-3">
                <div className="rounded-md border border-slate-200 bg-white p-4">
                  <IssueDetail
                    issue={group.instances[selectedIdx]}
                    onClose={() => setSelectedIdx(null)}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function severityPillClass(s: Severity): string {
  switch (s) {
    case "critical":
      return "bg-red-50 text-red-700";
    case "serious":
      return "bg-fuchsia-50 text-fuchsia-700";
    case "moderate":
      return "bg-amber-50 text-amber-800";
    case "minor":
      return "bg-slate-100 text-slate-700";
  }
}
