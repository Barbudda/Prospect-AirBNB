import { NextResponse } from "next/server";
import { getScannerRunById } from "@/lib/scanner-mock-data";

export async function POST(_request: Request, { params }: { params: { id: string } }) {
  const run = getScannerRunById(params.id);
  if (!run) return NextResponse.json({ error: "Scanner run not found" }, { status: 404 });
  return NextResponse.json({ run: { ...run, status: "cancelled", progress: Math.min(run.progress, 99), logs: [...run.logs, "Run annulé par l'utilisateur."] } });
}
