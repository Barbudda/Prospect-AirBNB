import { NextResponse } from "next/server";
import { getScannerSourcesByRunId } from "@/lib/scanner-mock-data";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  return NextResponse.json({ sources: getScannerSourcesByRunId(params.id) });
}
