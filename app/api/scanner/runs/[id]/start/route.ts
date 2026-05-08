import { NextResponse } from "next/server";
export async function POST() { return NextResponse.json({ error: "Use POST /api/search instead" }, { status: 410 }); }
