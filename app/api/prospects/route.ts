import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get("city");
  const status = searchParams.get("status");
  const priority = searchParams.get("priority");
  const targetType = searchParams.get("targetType");
  const hasEmail = searchParams.get("hasEmail");
  const hasPhone = searchParams.get("hasPhone");

  const where: Record<string, unknown> = {};

  if (city) where.city = { equals: city, mode: "insensitive" };
  if (status && status !== "all") where.status = status;
  if (priority && priority !== "all") where.priority = priority;
  if (targetType && targetType !== "all") where.targetType = targetType;
  if (hasEmail === "true") where.email = { not: null };
  if (hasPhone === "true") where.phone = { not: null };

  const prospects = await prisma.prospect.findMany({
    where,
    orderBy: [
      { priority: "asc" }, // high < low alphabetically, so we need custom sort below
      { createdAt: "desc" },
    ],
    include: { prospectNotes: { orderBy: { createdAt: "desc" } } },
  });

  // Sort by priority: high > medium > low
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  prospects.sort((a, b) => {
    const pa = priorityOrder[a.priority as keyof typeof priorityOrder] ?? 3;
    const pb = priorityOrder[b.priority as keyof typeof priorityOrder] ?? 3;
    return pa - pb;
  });

  return NextResponse.json({ prospects });
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const prospect = await prisma.prospect.create({
    data: {
      name: body.name,
      city: body.city,
      country: body.country || "France",
      targetType: body.targetType || "unknown",
      description: body.description,
      source: body.source || "Manual",
      sourceUrl: body.sourceUrl || "",
      website: body.website,
      email: body.email,
      phone: body.phone,
      instagram: body.instagram,
      facebook: body.facebook,
      linkedin: body.linkedin,
      priority: body.priority || "medium",
      confidence: body.confidence || "medium",
      status: body.status || "new",
      notes: body.notes,
    },
  });

  return NextResponse.json({ prospect }, { status: 201 });
}
