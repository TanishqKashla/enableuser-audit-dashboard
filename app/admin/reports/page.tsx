import { prisma } from "@/lib/db";
import ReportsIndex, {
  ReportRow,
} from "../_components/ReportsIndex";

export const dynamic = "force-dynamic";

export default async function AdminReportsPage() {
  const reports = await prisma.report.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      clientName: true,
      createdAt: true,
      updatedAt: true,
      issues: true,
    },
  });

  const rows: ReportRow[] = reports.map((r) => ({
    id: r.id,
    title: r.title,
    clientName: r.clientName,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
    totalIssues: Array.isArray(r.issues) ? r.issues.length : 0,
  }));

  return <ReportsIndex rows={rows} />;
}
