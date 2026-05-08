import { NextResponse } from "next/server";
import { getScannerInsightsByRunId, getScannerRunById, getScannerSourcesByRunId } from "@/lib/scanner-mock-data";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const run = getScannerRunById(params.id);
  if (!run) return NextResponse.json({ error: "Scanner run not found" }, { status: 404 });
  return NextResponse.json({ run, sources: getScannerSourcesByRunId(params.id), insights: getScannerInsightsByRunId(params.id) });
}
