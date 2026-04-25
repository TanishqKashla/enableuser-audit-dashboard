import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import Dashboard from "@/app/reports/_components/Dashboard";
import BrandHeader from "@/app/_components/BrandHeader";
import { Issue } from "@/app/reports/_lib/types";

export const dynamic = "force-dynamic";

interface Props {
  params: { uuid: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const report = await prisma.report.findUnique({
    where: { id: params.uuid },
    select: { title: true, clientName: true },
  });
  if (!report) return { title: "Report not found" };
  return {
    title: report.clientName
      ? `${report.title} — ${report.clientName}`
      : report.title,
    robots: { index: false, follow: false },
  };
}

export default async function PublicReportPage({ params }: Props) {
  const report = await prisma.report.findUnique({
    where: { id: params.uuid },
  });
  if (!report) notFound();

  const issues = (report.issues as unknown as Issue[]) ?? [];
  const auditedUrls = (report.auditedUrls as unknown as string[]) ?? [];
  const hasCsv = Boolean(report.rawCsv);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
          <BrandHeader size="sm" />
          <span className="hidden text-xs uppercase tracking-[0.2em] text-slate-500 sm:inline">
            Accessibility Report
          </span>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
        <header className="mb-6 flex flex-wrap items-start justify-between gap-4 sm:mb-8">
          <div className="min-w-0">
            <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">
              {report.title}
            </h1>
            {report.clientName && (
              <p className="mt-1 text-sm text-slate-600">{report.clientName}</p>
            )}
            <p className="mt-2 text-xs text-slate-500">
              Generated {report.createdAt.toLocaleString()}
            </p>
          </div>
          {hasCsv && (
            <a
              href={`/r/${params.uuid}/csv`}
              download
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden
              >
                <path
                  d="M8 2v8m0 0l-3-3m3 3l3-3M3 13h10"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Download report
            </a>
          )}
        </header>

        <Dashboard report={{ issues, auditedUrls }} />
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 text-xs text-slate-500 sm:px-6">
          <p>
            Powered by{" "}
            <span className="font-medium text-brand">Enableuser</span> —
            Enterprise Accessibility Infrastructure.
          </p>
        </div>
      </footer>
    </div>
  );
}
