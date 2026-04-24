import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/session";
import { parseCsv, CsvParseError } from "@/app/reports/_lib/parseCsv";
import { parseUrls } from "@/app/reports/_lib/parseUrls";

export const runtime = "nodejs";
export const maxDuration = 30;

const MAX_CSV_BYTES = 2 * 1024 * 1024;

const Body = z.object({
  title: z.string().trim().min(1, "Title is required.").max(200),
  clientName: z.string().trim().max(200).optional(),
  csvText: z.string().min(1, "CSV is required."),
  urlText: z.string().optional().default(""),
  storeRawCsv: z.boolean().optional().default(true),
});

export async function POST(req: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid body." },
      { status: 400 },
    );
  }

  const { title, clientName, csvText, urlText, storeRawCsv } = parsed.data;

  if (new TextEncoder().encode(csvText).byteLength > MAX_CSV_BYTES) {
    return NextResponse.json(
      { error: "CSV exceeds the 2 MB size limit." },
      { status: 413 },
    );
  }

  let issues;
  try {
    const result = parseCsv(csvText);
    issues = result.issues;
  } catch (err) {
    if (err instanceof CsvParseError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to parse CSV." },
      { status: 400 },
    );
  }

  const { urls } = parseUrls(urlText);

  const report = await prisma.report.create({
    data: {
      title,
      clientName: clientName || null,
      issues: issues as unknown as object[],
      auditedUrls: urls,
      rawCsv: storeRawCsv ? csvText : null,
      createdById: admin.id,
    },
    select: { id: true },
  });

  return NextResponse.json({ id: report.id }, { status: 201 });
}

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const reports = await prisma.report.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      clientName: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return NextResponse.json({ reports });
}
