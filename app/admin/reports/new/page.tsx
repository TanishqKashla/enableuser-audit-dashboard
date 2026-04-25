import Link from "next/link";
import NewReportForm from "../../_components/NewReportForm";

export default function NewReportPage() {
  return (
    <div>
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/admin/reports"
            className="text-sm text-slate-600 underline hover:text-slate-900"
          >
            ← Reports
          </Link>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900">
            New report
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Upload a site-scanner CSV export. The report will be saved and a
            public shareable link generated.
          </p>
        </div>
        <Link
          href="/admin/reports/new-bulk"
          className="inline-flex items-center gap-1.5 rounded-md border border-brand-200 bg-brand-50 px-3 py-2 text-sm font-medium text-brand transition hover:bg-brand-100"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden
          >
            <path
              d="M3 4h10M3 8h10M3 12h10"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          Bulk upload
        </Link>
      </header>

      <NewReportForm />
    </div>
  );
}
