import { NextResponse } from "next/server";
import { mockScannerInsights } from "@/lib/scanner-mock-data";

export async function GET() {
  return NextResponse.json({ insights: mockScannerInsights });
}
