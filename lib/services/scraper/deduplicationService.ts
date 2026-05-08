import type { ScoredLead } from "./types";

function getDomain(url: string): string | null {
  try {
    return new URL(url).hostname.replace("www.", "").toLowerCase();
  } catch {
    return null;
  }
}

function normalizeEmail(e: string) {
  return e.toLowerCase().trim();
}

function normalizePhone(p: string) {
  return p.replace(/[\s.\-()]/g, "");
}

export function deduplicateLeads(leads: ScoredLead[]): {
  unique: ScoredLead[];
  duplicatesCount: number;
} {
  const byDomain = new Map<string, ScoredLead>();
  const byEmail = new Map<string, ScoredLead>();
  const byPhone = new Map<string, ScoredLead>();
  const unique: ScoredLead[] = [];
  let duplicatesCount = 0;

  for (const lead of leads) {
    const domain = getDomain(lead.website);
    const email = lead.email ? normalizeEmail(lead.email) : null;
    const phone = lead.phone ? normalizePhone(lead.phone) : null;

    let existing: ScoredLead | undefined;
    if (domain && byDomain.has(domain)) existing = byDomain.get(domain);
    else if (email && byEmail.has(email)) existing = byEmail.get(email);
    else if (phone && byPhone.has(phone)) existing = byPhone.get(phone);

    if (existing) {
      // Merge missing fields into the existing lead
      if (!existing.email && lead.email) existing.email = lead.email;
      if (!existing.phone && lead.phone) existing.phone = lead.phone;
      if (!existing.instagram && lead.instagram) existing.instagram = lead.instagram;
      if (!existing.facebook && lead.facebook) existing.facebook = lead.facebook;
      if (!existing.linkedin && lead.linkedin) existing.linkedin = lead.linkedin;
      duplicatesCount++;
    } else {
      unique.push(lead);
      if (domain) byDomain.set(domain, lead);
      if (email) byEmail.set(email, lead);
      if (phone) byPhone.set(phone, lead);
    }
  }

  return { unique, duplicatesCount };
}
