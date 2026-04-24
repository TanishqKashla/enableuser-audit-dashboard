"use client";

import { Issue } from "../_lib/types";

interface Props {
  issue: Issue;
  onClose?: () => void;
}

export default function IssueDetail({ issue, onClose }: Props) {
  return (
    <div className="relative">
      {onClose && (
        <button
          onClick={onClose}
          aria-label="Close detail"
          className="absolute right-0 top-0 rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path
              d="M3 3l10 10M13 3L3 13"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}

      <div className="space-y-5 pr-8 text-sm">
        <Field label="Affected page">
          <a
            href={issue.affectedPage}
            target="_blank"
            rel="noopener noreferrer"
            className="break-all text-brand underline hover:text-brand-700"
          >
            {issue.affectedPage}
          </a>
        </Field>

        <Field label="Description">
          <p className="text-slate-800">{issue.description || "—"}</p>
        </Field>

        <Field label="How to fix">
          <pre className="whitespace-pre-wrap rounded-md border border-slate-200 bg-slate-50 p-3 font-sans text-xs leading-relaxed text-slate-800">
            {issue.howToFix || "—"}
          </pre>
        </Field>

        <Field label="HTML snippet">
          <pre className="overflow-x-auto whitespace-pre-wrap break-all rounded-md border border-slate-200 bg-slate-900 p-3 font-mono text-xs leading-relaxed text-slate-100">
            {issue.htmlSnippet || "—"}
          </pre>
        </Field>

        <Field label="Component">
          <code className="break-all font-mono text-xs text-slate-800">
            {issue.component || "—"}
          </code>
        </Field>

        <Field label="CSS selector">
          <code className="break-all font-mono text-xs text-slate-800">
            {issue.cssSelector || "—"}
          </code>
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Status" compact>
            {issue.issueStatus || "—"}
          </Field>
          <Field label="Needs review" compact>
            {issue.needsReview ? "Yes" : "No"}
          </Field>
          <Field label="Review status" compact>
            {issue.needsReviewStatus || "—"}
          </Field>
          <Field label="Best practice" compact>
            {issue.bestPractice ? "Yes" : "No"}
          </Field>
          <Field label="Behavior" compact>
            {issue.behavior || "—"}
          </Field>
          <Field label="Timestamp" compact>
            {issue.timestamp || "—"}
          </Field>
        </div>

      </div>
    </div>
  );
}

function Field({
  label,
  children,
  compact,
}: {
  label: string;
  children: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <div>
      <div
        className={`text-xs font-semibold uppercase tracking-wide text-slate-500 ${
          compact ? "mb-0.5" : "mb-1.5"
        }`}
      >
        {label}
      </div>
      <div className="text-sm">{children}</div>
    </div>
  );
}
