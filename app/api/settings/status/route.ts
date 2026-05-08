import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const totalProspects = await prisma.prospect.count();

  const sources = [
    {
      id: "web_search",
      label: "Web Search (DuckDuckGo)",
      description: "Free web search, no API key required.",
      status: "enabled" as const,
    },
    {
      id: "serpapi",
      label: "SerpAPI (Google Search)",
      description: "Reliable Google search results. Add SERPAPI_API_KEY to .env.",
      status: process.env.SERPAPI_API_KEY ? ("enabled" as const) : ("not_configured" as const),
    },
    {
      id: "google_places",
      label: "Google Places API",
      description: "Local businesses, phone, address. Add GOOGLE_MAPS_API_KEY to .env.",
      status: process.env.GOOGLE_MAPS_API_KEY
        ? ("enabled" as const)
        : ("not_configured" as const),
    },
  ];

  return NextResponse.json({
    sources,
    senderName: process.env.SENDER_NAME || "",
    totalProspects,
  });
}
