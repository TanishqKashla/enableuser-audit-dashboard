"use client";

import { useState } from "react";
import { ParsedReport } from "../_lib/types";
import SummaryTab from "./SummaryTab";
import AllIssuesTab from "./AllIssuesTab";
import FaqTab from "./FaqTab";

interface Props {
  report: ParsedReport;
  isAdmin?: boolean;
}

type TabId = "summary" | "issues" | "faq";

const TABS: { id: TabId; label: string }[] = [
  { id: "summary", label: "Summary" },
  { id: "issues", label: "All issues" },
  { id: "faq", label: "FAQ" },
];

export default function Dashboard({ report, isAdmin }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>("summary");

  if (report.issues.length === 0) {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-8 text-center">
        <div className="text-3xl">✓</div>
        <h2 className="mt-2 text-lg font-semibold text-emerald-900">
          No issues found
        </h2>
        <p className="mt-1 text-sm text-emerald-800">
          The uploaded CSV contains no accessibility issues.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div
        role="tablist"
        aria-label="Report sections"
        className="flex items-center gap-1 border-b border-slate-200"
      >
        {TABS.map((tab) => {
          const selected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={selected}
              aria-controls={`tab-panel-${tab.id}`}
              id={`tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition ${
                selected
                  ? "border-brand text-brand"
                  : "border-transparent text-slate-600 hover:border-slate-300 hover:text-slate-900"
              }`}
            >
              {tab.label}
              {tab.id === "issues" && (
                <span
                  className={`ml-2 rounded-full px-1.5 py-0.5 text-xs ${
                    selected
                      ? "bg-brand-50 text-brand"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {report.issues.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`tab-panel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
      >
        {activeTab === "summary" && <SummaryTab report={report} />}
        {activeTab === "issues" && (
          <AllIssuesTab report={report} showTimestamp={isAdmin} />
        )}
        {activeTab === "faq" && <FaqTab />}
      </div>
    </div>
  );
}
