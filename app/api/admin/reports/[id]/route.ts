import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/session";
import { parseCsv, CsvParseError } from "@/app/reports/_lib/parseCsv";
import { parseUrls } from "@/app/reports/_lib/parseUrls";
import { validateCsvUrlMatch } from "@/app/reports/_lib/validate";
import { Issue } from "@/app/reports/_lib/types";

export const runtime = "nodejs";
export const maxDuration = 30;

const MAX_CSV_BYTES = 2 * 1024 * 1024;

const PatchBody = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  clientName: z.string().trim().max(200).nullable().optional(),
  csvText: z.string().min(1).optional(),
  urlText: z.string().optional(),
  storeRawCsv: z.boolean().optional(),
  ignoreWarnings: z.boolean().optional(),
});

interface Ctx {
  params: { id: string };
}

export async function GET(_req: Request, { params }: Ctx) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const report = await prisma.report.findUnique({ where: { id: params.id } });
  if (!report) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ report });
}

export async function PATCH(req: Request, { params }: Ctx) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = PatchBody.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid body." },
      { status: 400 },
    );
  }

  const data: {
    title?: string;
    clientName?: string | null;
    issues?: object[];
    auditedUrls?: string[];
    rawCsv?: string | null;
  } = {};

  if (parsed.data.title !== undefined) data.title = parsed.data.title;
  if (parsed.data.clientName !== undefined)
    data.clientName = parsed.data.clientName || null;

  if (parsed.data.csvText !== undefined) {
    if (new TextEncoder().encode(parsed.data.csvText).byteLength > MAX_CSV_BYTES) {
      return NextResponse.json(
        { error: "CSV exceeds the 2 MB size limit." },
        { status: 413 },
      );
    }
    try {
      const result = parseCsv(parsed.data.csvText);
      data.issues = result.issues as unknown as object[];
    } catch (err) {
      if (err instanceof CsvParseError) {
        return NextResponse.json({ error: err.message }, { status: 400 });
      }
      return NextResponse.json(
        { error: "Failed to parse CSV." },
        { status: 400 },
      );
    }
    data.rawCsv = parsed.data.storeRawCsv === false ? null : parsed.data.csvText;
  }

  if (parsed.data.urlText !== undefined) {
    const { urls } = parseUrls(parsed.data.urlText);
    data.auditedUrls = urls;
  }

  if (data.issues !== undefined || data.auditedUrls !== undefined) {
    const existing = await prisma.report.findUnique({
      where: { id: params.id },
      select: { issues: true, auditedUrls: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const effectiveIssues = (data.issues ??
      existing.issues) as unknown as Issue[];
    const effectiveUrls = (data.auditedUrls ??
      existing.auditedUrls) as unknown as string[];
    const match = validateCsvUrlMatch(effectiveIssues ?? [], effectiveUrls ?? []);
    if (match.errors.length > 0) {
      return NextResponse.json(
        { error: match.errors.join(" "), errors: match.errors },
        { status: 400 },
      );
    }
    if (match.warnings.length > 0 && !parsed.data.ignoreWarnings) {
      return NextResponse.json(
        {
          error: "Warnings need confirmation before saving.",
          warnings: match.warnings,
          requiresConfirmation: true,
        },
        { status: 409 },
      );
    }
  }

  try {
    const updated = await prisma.report.update({
      where: { id: params.id },
      data,
      select: { id: true },
    });
    return NextResponse.json({ id: updated.id });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    await prisma.report.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
