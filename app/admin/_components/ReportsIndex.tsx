"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import CopyLinkButton from "./CopyLinkButton";

export interface ReportRow {
  id: string;
  title: string;
  clientName: string | null;
  createdAt: string;
  updatedAt: string;
  totalIssues: number;
}

type SortKey =
  | "newest"
  | "oldest"
  | "issues-desc"
  | "issues-asc"
  | "title"
  | "client";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "issues-desc", label: "Most issues" },
  { value: "issues-asc", label: "Fewest issues" },
  { value: "title", label: "Title (A–Z)" },
  { value: "client", label: "Client (A–Z)" },
];

interface Props {
  rows: ReportRow[];
}

export default function ReportsIndex({ rows }: Props) {
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("newest");
  const [clientFilter, setClientFilter] = useState<string>("all");

  const clients = useMemo(() => {
    const set = new Set<string>();
    for (const r of rows) if (r.clientName) set.add(r.clientName);
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [rows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const out = rows.filter((r) => {
      if (q) {
        const hay = `${r.title} ${r.clientName ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (clientFilter !== "all" && r.clientName !== clientFilter) return false;
      return true;
    });

    const sorted = [...out].sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return b.createdAt.localeCompare(a.createdAt);
        case "oldest":
          return a.createdAt.localeCompare(b.createdAt);
        case "issues-desc":
          return b.totalIssues - a.totalIssues;
        case "issues-asc":
          return a.totalIssues - b.totalIssues;
        case "title":
          return a.title.localeCompare(b.title);
        case "client":
          return (a.clientName ?? "").localeCompare(b.clientName ?? "");
      }
    });
    return sorted;
  }, [rows, query, sortBy, clientFilter]);

  const hasActiveFilters =
    query.trim() !== "" || clientFilter !== "all" || sortBy !== "newest";

  function resetAll() {
    setQuery("");
    setSortBy("newest");
    setClientFilter("all");
  }

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Reports</h1>
          <p className="mt-1 text-sm text-slate-600">
            {rows.length === 0
              ? "No reports yet."
              : `${filtered.length} of ${rows.length} report${rows.length === 1 ? "" : "s"}`}
          </p>
        </div>
        <Link
          href="/admin/reports/new"
          className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700"
        >
          New report
        </Link>
      </header>

      {rows.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-12 text-center">
          <p className="text-sm text-slate-600">
            Create your first report to see it here.
          </p>
          <Link
            href="/admin/reports/new"
            className="mt-4 inline-block rounded-md bg-brand px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700"
          >
            New report
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3">
            <div className="relative">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search title or client"
                className="h-8 w-56 rounded-md border border-slate-300 bg-white pl-8 pr-2 text-sm focus:border-slate-500 focus:outline-none"
              />
              <svg
                aria-hidden
                width="14"
                height="14"
                viewBox="0 0 16 16"
                className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-slate-400"
              >
                <circle
                  cx="7"
                  cy="7"
                  r="4.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  fill="none"
                />
                <path
                  d="M11 11l3 3"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <select
              value={clientFilter}
              onChange={(e) => setClientFilter(e.target.value)}
              className="h-8 rounded-md border border-slate-300 bg-white px-2 text-sm"
              aria-label="Filter by client"
            >
              <option value="all">All clients</option>
              {clients.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortKey)}
              className="ml-auto h-8 rounded-md border border-slate-300 bg-white px-2 text-sm"
              aria-label="Sort"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>

            {hasActiveFilters && (
              <button
                onClick={resetAll}
                className="h-8 rounded-md px-2 text-xs text-slate-600 underline hover:text-slate-900"
              >
                Reset
              </button>
            )}
          </div>

          {filtered.length === 0 ? (
            <div className="px-4 py-12 text-center text-sm text-slate-500">
              No reports match the current filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-white text-left text-xs uppercase tracking-wide text-slate-500">
                  <tr className="border-b border-slate-100">
                    <th className="px-4 py-3 font-medium">Title</th>
                    <th className="px-4 py-3 font-medium">Client</th>
                    <th className="px-4 py-3 font-medium">Issues</th>
                    <th className="px-4 py-3 font-medium">Created</th>
                    <th className="px-4 py-3 text-right font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr
                      key={r.id}
                      className="border-t border-slate-100 align-middle hover:bg-slate-50/60"
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/reports/${r.id}`}
                          className="font-medium text-slate-900 hover:text-brand"
                        >
                          {r.title}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {r.clientName || "—"}
                      </td>
                      <td className="px-4 py-3 font-medium tabular-nums text-slate-900">
                        {r.totalIssues}
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {new Date(r.createdAt).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={`/r/${r.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                          >
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 16 16"
                              fill="none"
                              aria-hidden
                            >
                              <path
                                d="M8 3.5C4.5 3.5 2 8 2 8s2.5 4.5 6 4.5S14 8 14 8s-2.5-4.5-6-4.5z"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinejoin="round"
                              />
                              <circle
                                cx="8"
                                cy="8"
                                r="2"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                fill="none"
                              />
                            </svg>
                            View report
                          </a>
                          <Link
                            href={`/admin/reports/${r.id}/edit`}
                            className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                          >
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 16 16"
                              fill="none"
                              aria-hidden
                            >
                              <path
                                d="M11 2.5l2.5 2.5-8 8H3v-2.5l8-8z"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinejoin="round"
                              />
                            </svg>
                            Edit report
                          </Link>
                          <CopyLinkButton
                            path={`/r/${r.id}`}
                            label="Copy link"
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
