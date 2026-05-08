import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateOutreachMessage } from "@/lib/services/outreachGenerator";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { prospectId } = await req.json();
  const prospect = await prisma.prospect.findUnique({ where: { id: prospectId } });
  if (!prospect) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const messages = generateOutreachMessage({
    name: prospect.name,
    city: prospect.city,
    targetType: prospect.targetType,
    email: prospect.email,
    phone: prospect.phone,
    instagram: prospect.instagram,
  });
  return NextResponse.json({ messages });
}
