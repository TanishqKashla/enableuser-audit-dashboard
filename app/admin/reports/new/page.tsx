import Link from "next/link";
import NewReportForm from "../../_components/NewReportForm";

export default function NewReportPage() {
  return (
    <div>
      <header className="mb-6">
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
      </header>

      <NewReportForm />
    </div>
  );
}
