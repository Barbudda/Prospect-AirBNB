import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Params = { params: { id: string } };

export async function GET(_req: Request, { params }: Params) {
  const run = await (prisma as any).scrapeRun.findUnique({
    where: { id: params.id },
    include: {
      logs: { orderBy: { createdAt: "asc" } },
      prospects: {
        select: {
          id: true,
          name: true,
          city: true,
          targetType: true,
          email: true,
          phone: true,
          website: true,
          instagram: true,
          priority: true,
          confidence: true,
          signals: true,
          angle: true,
          nextAction: true,
          sourceUrl: true,
        },
      },
    },
  });

  if (!run) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ run });
}
