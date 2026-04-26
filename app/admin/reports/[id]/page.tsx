import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import Dashboard from "@/app/reports/_components/Dashboard";
import { Issue } from "@/app/reports/_lib/types";
import DeleteReportButton from "../../_components/DeleteReportButton";

export const dynamic = "force-dynamic";

interface Props {
  params: { id: string };
}

export default async function AdminReportViewPage({ params }: Props) {
  const report = await prisma.report.findUnique({
    where: { id: params.id },
  });
  if (!report) notFound();

  const issues = (report.issues as unknown as Issue[]) ?? [];
  const auditedUrls = (report.auditedUrls as unknown as string[]) ?? [];

  return (
    <div>
      <div className="mb-4">
        <Link
          href="/admin/reports"
          className="text-sm text-slate-600 underline hover:text-slate-900"
        >
          ← Reports
        </Link>
      </div>

      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">
            {report.title}
          </h1>
          {report.clientName && (
            <p className="mt-1 text-sm text-slate-600">{report.clientName}</p>
          )}
          <p className="mt-2 break-all text-xs text-slate-500">
            Created {report.createdAt.toLocaleString()} · ID{" "}
            <code className="font-mono">{report.id}</code>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/r/${report.id}`}
            target="_blank"
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Public link ↗
          </Link>
          {report.rawCsv && (
            <a
              href={`/r/${report.id}/csv`}
              download
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Download CSV
            </a>
          )}
          <Link
            href={`/admin/reports/${report.id}/edit`}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Edit
          </Link>
          <DeleteReportButton reportId={report.id} />
        </div>
      </header>

      <Dashboard report={{ issues, auditedUrls }} isAdmin />
    </div>
  );
}
