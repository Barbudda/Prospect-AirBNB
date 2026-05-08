import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Params = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: Params) {
  const prospect = await prisma.prospect.findUnique({
    where: { id: params.id },
    include: { prospectNotes: { orderBy: { createdAt: "asc" } } },
  });

  if (!prospect) {
    return NextResponse.json({ error: "Prospect not found" }, { status: 404 });
  }

  return NextResponse.json({ prospect });
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const body = await req.json();

  const allowedFields = [
    "name", "city", "country", "targetType", "description",
    "website", "email", "phone", "instagram", "facebook", "linkedin",
    "priority", "status", "confidence", "interestLevel", "willingToPay",
    "notes", "nextFollowUpDate",
  ];

  const data: Record<string, unknown> = {};
  for (const field of allowedFields) {
    if (Object.prototype.hasOwnProperty.call(body, field)) {
      data[field] = body[field];
    }
  }

  const prospect = await prisma.prospect.update({
    where: { id: params.id },
    data,
    include: { prospectNotes: { orderBy: { createdAt: "asc" } } },
  });

  return NextResponse.json({ prospect });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  await prisma.prospect.delete({ where: { id: params.id } });
  return NextResponse.json({ deleted: true });
}
