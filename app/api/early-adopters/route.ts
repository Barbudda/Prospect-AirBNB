import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const [
    totalFound,
    contactable,
    contacted,
    replied,
    meetings,
    interested,
    willingToPay,
    hotProspects,
  ] = await Promise.all([
    prisma.prospect.count(),
    prisma.prospect.count({ where: { OR: [{ email: { not: null } }, { phone: { not: null } }] } }),
    prisma.prospect.count({ where: { status: { in: ["contacted", "replied", "meeting_scheduled", "interested", "willing_to_pay"] } } }),
    prisma.prospect.count({ where: { status: { in: ["replied", "meeting_scheduled", "interested", "willing_to_pay"] } } }),
    prisma.prospect.count({ where: { status: "meeting_scheduled" } }),
    prisma.prospect.count({ where: { status: { in: ["interested", "willing_to_pay"] } } }),
    prisma.prospect.count({ where: { willingToPay: true } }),
    prisma.prospect.findMany({
      where: {
        status: { in: ["interested", "willing_to_pay", "meeting_scheduled"] },
      },
      orderBy: { updatedAt: "desc" },
      take: 20,
    }),
  ]);

  return NextResponse.json({
    stats: {
      totalFound,
      contactable,
      contacted,
      replied,
      meetings,
      interested,
      willingToPay,
    },
    hotProspects,
  });
}
