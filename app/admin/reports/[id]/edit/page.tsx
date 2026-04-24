import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import EditReportForm from "../../../_components/EditReportForm";

interface Props {
  params: { id: string };
}

export default async function EditReportPage({ params }: Props) {
  const report = await prisma.report.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      title: true,
      clientName: true,
    },
  });
  if (!report) notFound();

  return (
    <div>
      <div className="mb-4">
        <Link
          href={`/admin/reports/${report.id}`}
          className="text-sm text-slate-600 underline hover:text-slate-900"
        >
          ← Back to report
        </Link>
      </div>
      <h1 className="text-2xl font-semibold text-slate-900">Edit report</h1>
      <p className="mt-1 text-sm text-slate-600">
        Update metadata or replace the CSV / URL list. Leave files empty to keep
        existing data.
      </p>

      <div className="mt-6">
        <EditReportForm
          reportId={report.id}
          initialTitle={report.title}
          initialClientName={report.clientName ?? ""}
        />
      </div>
    </div>
  );
}
