import { NextResponse } from "next/server";
export async function GET() { return NextResponse.json({ runs: [] }); }
export async function POST() { return NextResponse.json({ error: "Use /api/search instead" }, { status: 410 }); }
