import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const [total, high, toContact] = await Promise.all([
    prisma.prospect.count(),
    prisma.prospect.count({ where: { priority: "high" } }),
    prisma.prospect.count({ where: { status: { in: ["new", "to_contact"] } } }),
  ]);
  return NextResponse.json({ total, high, toContact });
}
