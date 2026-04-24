"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewReportForm() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [clientName, setClientName] = useState("");
  const [csvFileName, setCsvFileName] = useState<string | null>(null);
  const [csvText, setCsvText] = useState<string | null>(null);
  const [urlText, setUrlText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCsvFile(file: File) {
    setError(null);
    setCsvFileName(file.name);
    setCsvText(await file.text());
  }

  async function handleUrlFile(file: File) {
    setError(null);
    setUrlText(await file.text());
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!csvText) {
      setError("Please select a CSV file.");
      return;
    }
    if (!title.trim()) {
      setError("Please enter a title.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          clientName: clientName.trim() || undefined,
          csvText,
          urlText,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body?.error || "Failed to save report.");
        return;
      }
      const body = await res.json();
      window.open(`/admin/reports/${body.id}`, "_blank", "noopener,noreferrer");
      router.push("/admin/reports");
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
            placeholder="e.g. Silicon Road — Apr 24 scan"
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
            placeholder="Optional"
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          />
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="text-base font-semibold">CSV export</h2>
          <p className="mt-1 text-sm text-slate-600">
            Site-scanner CSV with all 17 expected columns.
          </p>
          <label className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-slate-300 px-6 py-10 text-center hover:border-slate-400">
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
          <h2 className="text-base font-semibold">Audited URLs (optional)</h2>
          <p className="mt-1 text-sm text-slate-600">
            One URL per line, or upload a .txt file.
          </p>
          <textarea
            value={urlText}
            onChange={(e) => setUrlText(e.target.value)}
            placeholder={"https://example.com/\nhttps://example.com/about"}
            className="mt-4 h-28 w-full resize-y rounded-md border border-slate-300 px-3 py-2 font-mono text-xs focus:border-slate-500 focus:outline-none"
          />
          <label className="mt-3 inline-flex cursor-pointer items-center gap-2 text-sm text-slate-700 underline hover:text-slate-900">
            <input
              type="file"
              accept=".txt,text/plain"
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleUrlFile(f);
              }}
            />
            Or upload a .txt file
          </label>
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
          disabled={submitting || !csvText}
          className="rounded-md bg-brand px-5 py-2.5 text-sm font-medium text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {submitting ? "Saving…" : "Save report"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/reports")}
          className="text-sm text-slate-600 underline hover:text-slate-900"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
