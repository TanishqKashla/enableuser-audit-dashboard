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

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <BrandHeader size="sm" />
          <span className="text-xs uppercase tracking-[0.2em] text-slate-500">
            Accessibility Report
          </span>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-6 py-10">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold text-slate-900">
            {report.title}
          </h1>
          {report.clientName && (
            <p className="mt-1 text-sm text-slate-600">{report.clientName}</p>
          )}
          <p className="mt-2 text-xs text-slate-500">
            Generated {report.createdAt.toLocaleString()}
          </p>
        </header>

        <Dashboard report={{ issues, auditedUrls }} />
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-6 text-xs text-slate-500">
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
