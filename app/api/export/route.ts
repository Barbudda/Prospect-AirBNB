import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const format = searchParams.get("format") || "csv";

  const prospects = await prisma.prospect.findMany({
    orderBy: { createdAt: "desc" },
  });

  if (format === "json") {
    const data = prospects.map((p) => ({
      name: p.name,
      city: p.city,
      country: p.country,
      type: p.targetType,
      email: p.email || "",
      phone: p.phone || "",
      website: p.website || "",
      instagram: p.instagram || "",
      facebook: p.facebook || "",
      linkedin: p.linkedin || "",
      source: p.source,
      source_url: p.sourceUrl,
      priority: p.priority,
      status: p.status,
      confidence: p.confidence,
      notes: p.notes || "",
      date_added: p.createdAt.toISOString().split("T")[0],
    }));

    return new NextResponse(JSON.stringify(data, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="prospects-${Date.now()}.json"`,
      },
    });
  }

  // CSV
  const headers = [
    "name", "city", "country", "type", "email", "phone",
    "website", "instagram", "facebook", "linkedin",
    "source", "source_url", "priority", "status", "confidence",
    "notes", "date_added",
  ];

  const escape = (v: string) => `"${(v || "").replace(/"/g, '""')}"`;

  const rows = prospects.map((p) =>
    [
      p.name,
      p.city,
      p.country,
      p.targetType,
      p.email || "",
      p.phone || "",
      p.website || "",
      p.instagram || "",
      p.facebook || "",
      p.linkedin || "",
      p.source,
      p.sourceUrl,
      p.priority,
      p.status,
      p.confidence,
      p.notes || "",
      p.createdAt.toISOString().split("T")[0],
    ]
      .map(escape)
      .join(",")
  );

  const csv = [headers.join(","), ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="prospects-${Date.now()}.csv"`,
    },
  });
}
