import type { PageData } from "./pageScraper";

export type ExtractedContact = {
  name: string | null;
  description: string | null;
  email: string | null;
  phone: string | null;
  instagram: string | null;
  facebook: string | null;
  linkedin: string | null;
  website: string;
  sourceUrl: string;
  isRelevant: boolean;
  relevanceScore: number;
};

// Keywords that indicate Airbnb / short-term rental relevance
const RELEVANCE_KEYWORDS = [
  "airbnb",
  "location courte durée",
  "location saisonnière",
  "conciergerie",
  "gestion locative",
  "gestionnaire",
  "property management",
  "property manager",
  "short-term rental",
  "vacation rental",
  "location meublée",
  "meublé touristique",
  "gîte",
  "chambre d'hôtes",
  "check-in",
  "check-out",
  "voyageurs",
  "hôte",
  "booking.com",
  "vrbo",
  "abritel",
  "homeaway",
  "channel manager",
  "pms",
  "concierge",
  "seasonal rental",
  "furnished rental",
  "self check-in",
];

// Business email patterns — not personal-looking, so more likely real contacts
const BUSINESS_EMAIL_PREFIXES = [
  "contact", "hello", "info", "reservation", "reservations",
  "booking", "bonjour", "conciergerie", "gestion", "location",
  "accueil", "office", "pro", "team", "equipe", "agence",
];

function extractEmails(text: string): string[] {
  const emailRegex = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
  const matches = text.match(emailRegex) || [];

  return [...new Set(matches)].filter((email) => {
    const lower = email.toLowerCase();
    // Skip common placeholder / example emails
    if (lower.includes("example.com")) return false;
    if (lower.includes("test.com")) return false;
    if (lower.includes("yourdomain")) return false;
    if (lower.includes("domain.com")) return false;
    if (lower.endsWith(".png") || lower.endsWith(".jpg")) return false;
    return true;
  });
}

function rankEmails(emails: string[]): string | null {
  if (emails.length === 0) return null;

  // Prefer business email prefixes
  const business = emails.find((e) => {
    const prefix = e.split("@")[0].toLowerCase();
    return BUSINESS_EMAIL_PREFIXES.some((p) => prefix.startsWith(p));
  });

  return business || emails[0];
}

function extractPhones(text: string): string | null {
  // French phone numbers: 0X XX XX XX XX, +33 X XX XX XX XX
  const phoneRegex =
    /(?:(?:\+33|0033)[\s.\-]?[1-9]|0[1-9])(?:[\s.\-]?\d{2}){4}/g;
  const matches = text.match(phoneRegex) || [];

  if (matches.length === 0) return null;

  // Normalize the first match
  const phone = (matches[0] ?? "").replace(/[\s.\-]/g, "");
  if (phone.startsWith("0033")) return "+33" + phone.slice(4);
  if (phone.startsWith("33") && phone.length === 11) return "+" + phone;
  if (phone.startsWith("0") && phone.length === 10) {
    return "+33" + phone.slice(1);
  }
  return phone;
}

function extractInstagram(html: string): string | null {
  const matches = html.match(/instagram\.com\/([a-zA-Z0-9._]+)/g);
  if (!matches) return null;

  for (const m of matches) {
    const username = m.split("/")[1];
    // Skip generic/nav Instagram links
    if (!username || ["p", "reel", "stories", "explore", "accounts"].includes(username))
      continue;
    return "https://instagram.com/" + username;
  }
  return null;
}

function extractFacebook(html: string): string | null {
  const matches = html.match(/facebook\.com\/([a-zA-Z0-9._\-]+)/g);
  if (!matches) return null;

  for (const m of matches) {
    const path = m.split("facebook.com/")[1];
    if (!path) continue;
    // Skip generic Facebook links
    if (
      ["sharer", "share", "dialog", "login", "groups", "pages", "photo", "video"].some(
        (s) => path.startsWith(s)
      )
    )
      continue;
    return "https://facebook.com/" + path;
  }
  return null;
}

function extractLinkedIn(html: string): string | null {
  const matches = html.match(/linkedin\.com\/(company\/|in\/)([a-zA-Z0-9._\-]+)/g);
  if (!matches || matches.length === 0) return null;
  return "https://" + matches[0];
}

function scoreRelevance(text: string): number {
  const lower = text.toLowerCase();
  let score = 0;
  for (const kw of RELEVANCE_KEYWORDS) {
    if (lower.includes(kw)) score++;
  }
  return score;
}

function extractName(pageData: PageData): string | null {
  const { title, description, url } = pageData;

  // Try og:site_name first (inside HTML)
  const ogSiteMatch = pageData.html.match(
    /<meta[^>]+property="og:site_name"[^>]+content="([^"]+)"/i
  );
  if (ogSiteMatch) return ogSiteMatch[1].trim();

  // Clean title — remove common suffixes
  if (title) {
    return title
      .replace(/\s*[-|–]\s*[^-|–]+$/, "")
      .replace(/\s*\|.*$/, "")
      .trim()
      .slice(0, 80) || null;
  }

  if (description) return description.slice(0, 60) + "...";

  // Fallback to domain name
  try {
    return new URL(url).hostname.replace("www.", "").split(".")[0];
  } catch {
    return null;
  }
}

export function extractContactInfo(pageData: PageData): ExtractedContact {
  const { text, html, url, title, description } = pageData;
  const combined = title + " " + description + " " + text;

  const emails = extractEmails(combined);
  const phone = extractPhones(combined);
  const instagram = extractInstagram(html);
  const facebook = extractFacebook(html);
  const linkedin = extractLinkedIn(html);
  const name = extractName(pageData);
  const relevanceScore = scoreRelevance(combined);
  const isRelevant = relevanceScore >= 1;

  // Determine website (canonical URL)
  let website = url;
  try {
    const parsed = new URL(url);
    website = `${parsed.protocol}//${parsed.hostname}`;
  } catch {
    // keep url as-is
  }

  return {
    name,
    description: description || null,
    email: rankEmails(emails),
    phone,
    instagram,
    facebook,
    linkedin,
    website,
    sourceUrl: url,
    isRelevant,
    relevanceScore,
  };
}
