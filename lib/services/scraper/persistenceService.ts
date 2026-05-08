import { prisma } from "@/lib/prisma";
import type { ScoredLead } from "./types";

export async function createScrapeRun(data: {
  targetDescription: string;
  location: string;
  country: string;
  industry?: string;
  keywords?: string;
  negativeKeywords?: string;
  sourcesUsed: string;
  maxResults: number;
  maxPagesPerSite: number;
}): Promise<string> {
  const run = await (prisma as any).scrapeRun.create({ data: { ...data, status: "running" } });
  return run.id;
}

export async function updateScrapeRun(
  id: string,
  data: {
    status?: string;
    completedAt?: Date;
    pagesAnalyzed?: number;
    leadsFound?: number;
    leadsSaved?: number;
    errors?: string;
  }
): Promise<void> {
  await (prisma as any).scrapeRun.update({ where: { id }, data });
}

export async function appendScrapeLog(
  scrapeRunId: string,
  level: string,
  message: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  await (prisma as any).scrapeLog.create({
    data: {
      scrapeRunId,
      level,
      message,
      metadata: metadata ? JSON.stringify(metadata) : null,
    },
  });
}

export async function saveLeads(
  leads: ScoredLead[],
  scrapeRunId: string,
  context: { city: string; country: string; industry?: string }
): Promise<{ saved: number; merged: number }> {
  let saved = 0;
  let merged = 0;

  for (const lead of leads) {
    try {
      const domain = getDomain(lead.website);

      // Build OR conditions for duplicate check
      const orConditions: object[] = [{ sourceUrl: lead.sourceUrl }];
      if (domain) orConditions.push({ website: { contains: domain } });
      if (lead.email) orConditions.push({ email: lead.email });

      const existing = await prisma.prospect.findFirst({
        where: { OR: orConditions },
      });

      if (existing) {
        // Merge missing fields
        const updates: Record<string, unknown> = { lastSeenAt: new Date() };
        if (!existing.email && lead.email) updates.email = lead.email;
        if (!existing.phone && lead.phone) updates.phone = lead.phone;
        if (!existing.instagram && lead.instagram) updates.instagram = lead.instagram;
        if (!existing.facebook && lead.facebook) updates.facebook = lead.facebook;
        if (!existing.linkedin && lead.linkedin) updates.linkedin = lead.linkedin;
        await (prisma.prospect as any).update({ where: { id: existing.id }, data: updates });
        merged++;
        continue;
      }

      await (prisma.prospect as any).create({
        data: {
          name: lead.name || getDomain(lead.website) || "Unknown",
          city: context.city || "Unknown",
          country: context.country,
          targetType: detectTargetType(lead, context.industry),
          industry: context.industry || null,
          description: lead.description || null,
          address: lead.address || null,
          source: "Scraper",
          sourceUrl: lead.sourceUrl,
          website: lead.website || null,
          email: lead.email || null,
          phone: lead.phone || null,
          instagram: lead.instagram || null,
          facebook: lead.facebook || null,
          linkedin: lead.linkedin || null,
          tiktok: lead.tiktok || null,
          twitter: lead.twitter || null,
          priority: lead.priority,
          confidence: lead.confidence,
          signals: JSON.stringify(lead.signals),
          technologyStack: JSON.stringify(lead.technologyStack),
          angle: lead.angle || null,
          nextAction: lead.nextAction || null,
          status: "new",
          scrapeRunId,
          lastSeenAt: new Date(),
        },
      });

      saved++;
    } catch {
      // Skip individual errors silently
    }
  }

  return { saved, merged };
}

function getDomain(url: string): string | null {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return null;
  }
}

function detectTargetType(lead: ScoredLead, industry?: string): string {
  if (industry === "concierge") return "concierge";
  if (industry === "hotel" || industry === "real_estate") return "agency";
  const text = ((lead.name || "") + " " + (lead.description || "")).toLowerCase();
  if (/concierg|property\s+manag|gestion\s+locative/.test(text)) return "concierge";
  if (/agence|agency/.test(text)) return "agency";
  if (/hôte|propriétaire|host/.test(text)) return "host_owner";
  return "unknown";
}
