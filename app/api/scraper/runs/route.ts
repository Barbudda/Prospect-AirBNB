import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const runs = await (prisma as any).scrapeRun.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      targetDescription: true,
      location: true,
      country: true,
      industry: true,
      sourcesUsed: true,
      status: true,
      startedAt: true,
      completedAt: true,
      pagesAnalyzed: true,
      leadsFound: true,
      leadsSaved: true,
      createdAt: true,
    },
  });
  return NextResponse.json({ runs });
}
