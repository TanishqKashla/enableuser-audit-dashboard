import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Ctx {
  params: { uuid: string };
}

function sanitize(name: string): string {
  return (
    name
      .replace(/[^A-Za-z0-9._\- ]+/g, "")
      .replace(/\s+/g, "_")
      .slice(0, 80) || "report"
  );
}

export async function GET(_req: Request, { params }: Ctx) {
  const report = await prisma.report.findUnique({
    where: { id: params.uuid },
    select: { title: true, rawCsv: true },
  });

  if (!report) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!report.rawCsv) {
    return NextResponse.json(
      { error: "CSV is not available for this report." },
      { status: 404 },
    );
  }

  const filename = `audit_report_enableuser_${sanitize(report.title)}.csv`;
  return new NextResponse(report.rawCsv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
