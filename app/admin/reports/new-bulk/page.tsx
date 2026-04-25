import Link from "next/link";
import BulkUploadForm from "../../_components/BulkUploadForm";

export default function NewBulkReportPage() {
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
            Bulk upload
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Drop multiple CSVs and matching URL lists. Files are paired
            automatically by domain, then saved as separate reports.
          </p>
        </div>
        <Link
          href="/admin/reports/new"
          className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Single upload
        </Link>
      </header>

      <BulkUploadForm />
    </div>
  );
}
