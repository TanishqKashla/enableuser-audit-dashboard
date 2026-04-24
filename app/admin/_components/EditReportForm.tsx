"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  reportId: string;
  initialTitle: string;
  initialClientName: string;
}

export default function EditReportForm({
  reportId,
  initialTitle,
  initialClientName,
}: Props) {
  const router = useRouter();

  const [title, setTitle] = useState(initialTitle);
  const [clientName, setClientName] = useState(initialClientName);
  const [csvFileName, setCsvFileName] = useState<string | null>(null);
  const [csvText, setCsvText] = useState<string | null>(null);
  const [replaceUrls, setReplaceUrls] = useState(false);
  const [urlText, setUrlText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCsvFile(file: File) {
    setError(null);
    setCsvFileName(file.name);
    setCsvText(await file.text());
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!title.trim()) {
      setError("Title cannot be empty.");
      return;
    }

    const payload: {
      title: string;
      clientName: string | null;
      csvText?: string;
      urlText?: string;
    } = {
      title: title.trim(),
      clientName: clientName.trim() || null,
    };
    if (csvText) payload.csvText = csvText;
    if (replaceUrls) payload.urlText = urlText;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/reports/${reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body?.error || "Failed to save.");
        return;
      }
      router.push(`/admin/reports/${reportId}`);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="grid gap-4 rounded-lg border border-slate-200 bg-white p-6 md:grid-cols-2">
        <div>
          <label className="block text-xs font-medium text-slate-700">
            Title <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700">
            Client name
          </label>
          <input
            type="text"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          />
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="text-base font-semibold">Replace CSV (optional)</h2>
          <p className="mt-1 text-sm text-slate-600">
            Upload a new CSV to overwrite the existing issues.
          </p>
          <label className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-slate-300 px-6 py-8 text-center hover:border-slate-400">
            <input
              type="file"
              accept=".csv,text/csv"
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleCsvFile(f);
              }}
            />
            <span className="text-sm font-medium text-slate-700">
              {csvFileName ?? "Click to choose a .csv file"}
            </span>
          </label>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">
              Replace audited URLs (optional)
            </h2>
            <label className="inline-flex items-center gap-2 text-xs text-slate-600">
              <input
                type="checkbox"
                checked={replaceUrls}
                onChange={(e) => setReplaceUrls(e.target.checked)}
              />
              Replace
            </label>
          </div>
          <textarea
            value={urlText}
            onChange={(e) => setUrlText(e.target.value)}
            disabled={!replaceUrls}
            placeholder={"https://example.com/\nhttps://example.com/about"}
            className="mt-4 h-28 w-full resize-y rounded-md border border-slate-300 px-3 py-2 font-mono text-xs focus:border-slate-500 focus:outline-none disabled:bg-slate-50 disabled:text-slate-400"
          />
          <p className="mt-2 text-xs text-slate-500">
            Checking &quot;Replace&quot; with an empty textarea will remove all
            audited URLs.
          </p>
        </section>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-brand px-5 py-2.5 text-sm font-medium text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {submitting ? "Saving…" : "Save changes"}
        </button>
        <button
          type="button"
          onClick={() => router.push(`/admin/reports/${reportId}`)}
          className="text-sm text-slate-600 underline hover:text-slate-900"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
