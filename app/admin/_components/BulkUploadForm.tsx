"use client";

import Papa from "papaparse";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Status = "queued" | "uploading" | "done" | "failed";

interface CsvFile {
  id: string;
  file: File;
  text: string;
  domain: string | null;
  rowCount: number;
}

interface UrlFile {
  id: string;
  file: File;
  text: string;
  domain: string | null;
  urlCount: number;
}

interface PairResult {
  csvId: string;
  urlId: string | null;
  title: string;
  status: Status;
  message?: string;
  reportId?: string;
}

function extractHost(raw: string): string | null {
  try {
    const h = new URL(raw).hostname.toLowerCase();
    return h.startsWith("www.") ? h.slice(4) : h;
  } catch {
    return null;
  }
}

function dominantHostFromList(values: string[]): {
  domain: string | null;
  count: number;
} {
  const counts = new Map<string, number>();
  for (const v of values) {
    const h = extractHost(v);
    if (!h) continue;
    counts.set(h, (counts.get(h) ?? 0) + 1);
  }
  let best: string | null = null;
  let bestCount = 0;
  for (const [host, n] of counts) {
    if (n > bestCount) {
      best = host;
      bestCount = n;
    }
  }
  return { domain: best, count: bestCount };
}

function parseCsvDomain(text: string): { domain: string | null; rows: number } {
  const result = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
    preview: 200,
  });
  const pages = (result.data ?? [])
    .map((r) => (r["Affected page"] ?? "").trim())
    .filter(Boolean);
  const { domain } = dominantHostFromList(pages);
  return { domain, rows: result.data?.length ?? 0 };
}

function parseUrlDomain(text: string): { domain: string | null; urls: number } {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  const { domain } = dominantHostFromList(lines);
  return { domain, urls: lines.length };
}

function fileBase(name: string): string {
  return name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").trim();
}

function domainToTitle(domain: string): string {
  const parts = domain.split(".");
  if (parts.length >= 2) return parts.slice(0, -1).join(".");
  return domain;
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export default function BulkUploadForm() {
  const router = useRouter();
  const [csvs, setCsvs] = useState<CsvFile[]>([]);
  const [urls, setUrls] = useState<UrlFile[]>([]);
  const [clientName, setClientName] = useState("");
  const [titleOverrides, setTitleOverrides] = useState<Record<string, string>>(
    {},
  );
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<Record<string, PairResult>>({});
  const [error, setError] = useState<string | null>(null);

  async function handleCsvFiles(fileList: FileList | null) {
    if (!fileList) return;
    const next: CsvFile[] = [];
    for (const f of Array.from(fileList)) {
      if (!/\.csv$/i.test(f.name)) continue;
      const text = await f.text();
      const { domain, rows } = parseCsvDomain(text);
      next.push({ id: uid(), file: f, text, domain, rowCount: rows });
    }
    setCsvs((prev) => [...prev, ...next]);
  }

  async function handleUrlFiles(fileList: FileList | null) {
    if (!fileList) return;
    const next: UrlFile[] = [];
    for (const f of Array.from(fileList)) {
      if (!/\.txt$/i.test(f.name)) continue;
      const text = await f.text();
      const { domain, urls: count } = parseUrlDomain(text);
      next.push({ id: uid(), file: f, text, domain, urlCount: count });
    }
    setUrls((prev) => [...prev, ...next]);
  }

  function removeCsv(id: string) {
    setCsvs((prev) => prev.filter((c) => c.id !== id));
  }
  function removeUrl(id: string) {
    setUrls((prev) => prev.filter((u) => u.id !== id));
  }

  // Pairing: for each CSV, pick the URL with matching domain. 1:1 — once paired,
  // a URL can't be reused. CSVs without a match upload as CSV-only.
  const pairs = useMemo(() => {
    const usedUrls = new Set<string>();
    return csvs.map((csv) => {
      let matched: UrlFile | null = null;
      if (csv.domain) {
        matched =
          urls.find((u) => !usedUrls.has(u.id) && u.domain === csv.domain) ??
          null;
      }
      if (matched) usedUrls.add(matched.id);
      return { csv, url: matched };
    });
  }, [csvs, urls]);

  const orphanUrls = useMemo(() => {
    const paired = new Set(
      pairs.map((p) => p.url?.id).filter(Boolean) as string[],
    );
    return urls.filter((u) => !paired.has(u.id));
  }, [pairs, urls]);

  function titleFor(csv: CsvFile): string {
    if (titleOverrides[csv.id] !== undefined) return titleOverrides[csv.id];
    if (csv.domain) return domainToTitle(csv.domain);
    return fileBase(csv.file.name);
  }

  function setTitleFor(csv: CsvFile, value: string) {
    setTitleOverrides((prev) => ({ ...prev, [csv.id]: value }));
  }

  async function uploadAll() {
    if (csvs.length === 0) {
      setError("Add at least one CSV file.");
      return;
    }
    setError(null);
    setRunning(true);
    const initial: Record<string, PairResult> = {};
    for (const p of pairs) {
      initial[p.csv.id] = {
        csvId: p.csv.id,
        urlId: p.url?.id ?? null,
        title: titleFor(p.csv),
        status: "queued",
      };
    }
    setResults(initial);

    for (const p of pairs) {
      setResults((prev) => ({
        ...prev,
        [p.csv.id]: { ...prev[p.csv.id], status: "uploading" },
      }));
      try {
        const res = await fetch("/api/admin/reports", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: titleFor(p.csv),
            clientName: clientName.trim() || undefined,
            csvText: p.csv.text,
            urlText: p.url?.text ?? "",
            ignoreWarnings: true,
          }),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          setResults((prev) => ({
            ...prev,
            [p.csv.id]: {
              ...prev[p.csv.id],
              status: "failed",
              message: body?.error || `HTTP ${res.status}`,
            },
          }));
          continue;
        }
        const body = await res.json();
        setResults((prev) => ({
          ...prev,
          [p.csv.id]: {
            ...prev[p.csv.id],
            status: "done",
            reportId: body.id,
          },
        }));
      } catch (e) {
        setResults((prev) => ({
          ...prev,
          [p.csv.id]: {
            ...prev[p.csv.id],
            status: "failed",
            message: e instanceof Error ? e.message : "Network error",
          },
        }));
      }
    }
    setRunning(false);
  }

  const successCount = Object.values(results).filter(
    (r) => r.status === "done",
  ).length;
  const failedCount = Object.values(results).filter(
    (r) => r.status === "failed",
  ).length;
  const allDone =
    csvs.length > 0 &&
    Object.values(results).length === csvs.length &&
    !running;

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-5 sm:p-6">
        <label className="block text-xs font-medium text-slate-700">
          Client name (applied to all reports, optional)
        </label>
        <input
          type="text"
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          placeholder="e.g. Silicon Road"
          className="mt-1 w-full max-w-md rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
        />
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <DropZone
          title="CSV reports"
          accept=".csv,text/csv"
          onFiles={handleCsvFiles}
          empty={csvs.length === 0}
          hint="Drop or click to add multiple .csv files."
        >
          <ul className="mt-3 divide-y divide-slate-100">
            {csvs.map((c) => (
              <li
                key={c.id}
                className="flex items-start gap-3 py-2 text-sm"
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium text-slate-800">
                    {c.file.name}
                  </span>
                  <span className="block text-xs text-slate-500">
                    {c.domain ? (
                      <>
                        domain:{" "}
                        <span className="font-mono text-slate-700">
                          {c.domain}
                        </span>{" "}
                        · {c.rowCount} rows
                      </>
                    ) : (
                      <span className="text-amber-700">
                        domain not detected · {c.rowCount} rows
                      </span>
                    )}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => removeCsv(c.id)}
                  disabled={running}
                  className="text-xs text-slate-500 hover:text-red-600 disabled:opacity-50"
                  aria-label={`Remove ${c.file.name}`}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        </DropZone>

        <DropZone
          title="URL lists"
          accept=".txt,text/plain"
          onFiles={handleUrlFiles}
          empty={urls.length === 0}
          hint="Drop or click to add multiple .txt files (one URL per line)."
        >
          <ul className="mt-3 divide-y divide-slate-100">
            {urls.map((u) => (
              <li
                key={u.id}
                className="flex items-start gap-3 py-2 text-sm"
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium text-slate-800">
                    {u.file.name}
                  </span>
                  <span className="block text-xs text-slate-500">
                    {u.domain ? (
                      <>
                        domain:{" "}
                        <span className="font-mono text-slate-700">
                          {u.domain}
                        </span>{" "}
                        · {u.urlCount} URLs
                      </>
                    ) : (
                      <span className="text-amber-700">
                        domain not detected · {u.urlCount} URLs
                      </span>
                    )}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => removeUrl(u.id)}
                  disabled={running}
                  className="text-xs text-slate-500 hover:text-red-600 disabled:opacity-50"
                  aria-label={`Remove ${u.file.name}`}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        </DropZone>
      </div>

      {pairs.length > 0 && (
        <section className="rounded-lg border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold">Detected pairs</h2>
            <span className="text-xs text-slate-500">
              {pairs.length} report{pairs.length === 1 ? "" : "s"} ready
            </span>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="pb-2 font-medium">CSV</th>
                  <th className="pb-2 font-medium">URL list</th>
                  <th className="pb-2 font-medium">Title</th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {pairs.map((p) => {
                  const r = results[p.csv.id];
                  return (
                    <tr
                      key={p.csv.id}
                      className="border-t border-slate-100 align-top"
                    >
                      <td className="py-2 pr-3">
                        <div className="font-medium text-slate-800">
                          {p.csv.file.name}
                        </div>
                        <div className="text-xs text-slate-500">
                          {p.csv.domain ?? "—"}
                        </div>
                      </td>
                      <td className="py-2 pr-3">
                        {p.url ? (
                          <>
                            <div className="text-slate-800">
                              {p.url.file.name}
                            </div>
                            <div className="text-xs text-slate-500">
                              {p.url.domain}
                            </div>
                          </>
                        ) : (
                          <span className="text-xs text-slate-500">
                            (no URL list — CSV only)
                          </span>
                        )}
                      </td>
                      <td className="py-2 pr-3">
                        <input
                          type="text"
                          value={titleFor(p.csv)}
                          onChange={(e) => setTitleFor(p.csv, e.target.value)}
                          disabled={running || r?.status === "done"}
                          className="w-full min-w-[140px] rounded-md border border-slate-300 px-2 py-1 text-sm focus:border-slate-500 focus:outline-none disabled:bg-slate-50"
                        />
                      </td>
                      <td className="py-2 pr-3">
                        <StatusBadge result={r} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {orphanUrls.length > 0 && (
            <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              <p className="font-medium">
                {orphanUrls.length} URL list
                {orphanUrls.length === 1 ? "" : "s"} could not be paired:
              </p>
              <ul className="mt-1 list-disc space-y-0.5 pl-5 text-xs">
                {orphanUrls.map((u) => (
                  <li key={u.id}>
                    {u.file.name}
                    {u.domain ? ` (${u.domain})` : ""}
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-xs">
                These will be ignored. Add a matching CSV or remove them.
              </p>
            </div>
          )}
        </section>
      )}

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={uploadAll}
          disabled={running || csvs.length === 0 || allDone}
          className="rounded-md bg-brand px-5 py-2.5 text-sm font-medium text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {running
            ? `Uploading (${successCount + failedCount}/${pairs.length})…`
            : allDone
              ? "Finished"
              : `Save ${pairs.length || ""} report${pairs.length === 1 ? "" : "s"}`.trim()}
        </button>
        {allDone && (
          <button
            type="button"
            onClick={() => router.push("/admin/reports")}
            className="text-sm text-slate-600 underline hover:text-slate-900"
          >
            Done
          </button>
        )}
        {allDone && (
          <span className="text-sm text-slate-600">
            ✓ {successCount} saved
            {failedCount > 0 ? ` · ✗ ${failedCount} failed` : ""}
          </span>
        )}
      </div>
    </div>
  );
}

function DropZone({
  title,
  accept,
  onFiles,
  empty,
  hint,
  children,
}: {
  title: string;
  accept: string;
  onFiles: (files: FileList | null) => void;
  empty: boolean;
  hint: string;
  children?: React.ReactNode;
}) {
  const [drag, setDrag] = useState(false);
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 sm:p-6">
      <h2 className="text-base font-semibold">{title}</h2>
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          onFiles(e.dataTransfer?.files ?? null);
        }}
        className={`mt-3 flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed px-6 py-6 text-center transition ${
          drag
            ? "border-brand bg-brand-50/50"
            : "border-slate-300 hover:border-slate-400"
        }`}
      >
        <input
          type="file"
          accept={accept}
          multiple
          className="sr-only"
          onChange={(e) => onFiles(e.target.files)}
        />
        <span className="text-sm font-medium text-slate-700">
          {empty ? "Click or drop files" : "Add more files"}
        </span>
        <span className="mt-1 text-xs text-slate-500">{hint}</span>
      </label>
      {children}
    </section>
  );
}

function StatusBadge({ result }: { result?: PairResult }) {
  if (!result) {
    return (
      <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
        Ready
      </span>
    );
  }
  switch (result.status) {
    case "queued":
      return (
        <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
          Queued
        </span>
      );
    case "uploading":
      return (
        <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700">
          Uploading…
        </span>
      );
    case "done":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-800">
          ✓ Saved
          {result.reportId && (
            <a
              href={`/admin/reports/${result.reportId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-1 underline"
            >
              view
            </a>
          )}
        </span>
      );
    case "failed":
      return (
        <span
          className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-xs text-red-700"
          title={result.message}
        >
          ✗ Failed
        </span>
      );
  }
}
