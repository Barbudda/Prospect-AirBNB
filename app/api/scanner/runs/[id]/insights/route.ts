import { NextResponse } from "next/server";
import { getScannerInsightsByRunId } from "@/lib/scanner-mock-data";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  return NextResponse.json({ insights: getScannerInsightsByRunId(params.id) });
}
