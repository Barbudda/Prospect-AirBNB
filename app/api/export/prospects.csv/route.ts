import { NextResponse } from "next/server";
// Redirect to the new export endpoint
export async function GET() {
  return NextResponse.redirect(new URL("/api/export?format=csv", "http://localhost:3000"));
}
