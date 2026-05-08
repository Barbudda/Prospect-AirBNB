import type { ExtractedContact } from "./contactExtractor";

export type ProspectType =
  | "concierge"
  | "property_manager"
  | "host_owner"
  | "agency"
  | "unknown";

export type Priority = "high" | "medium" | "low";
export type Confidence = "high" | "medium" | "low";

export type ClassifiedProspect = {
  name: string;
  city: string;
  country: string;
  targetType: ProspectType;
  description: string | null;
  source: string;
  sourceUrl: string;
  website: string;
  email: string | null;
  phone: string | null;
  instagram: string | null;
  facebook: string | null;
  linkedin: string | null;
  priority: Priority;
  confidence: Confidence;
};

const CONCIERGE_KEYWORDS = [
  "conciergerie", "concierge", "conciergerie airbnb", "gestion locative",
  "property management", "property manager", "gestionnaire", "gestion courte durée",
  "gestion saisonnière", "management", "manager", "services aux hôtes",
];

const AGENCY_KEYWORDS = [
  "agence", "agency", "agence immobilière", "real estate", "sarl", "sas", "sci",
  "immobilier", "groupe", "réseau",
];

const HOST_KEYWORDS = [
  "hôte", "propriétaire", "particulier", "villa", "appartement", "chalet",
  "location meublée", "gîte", "maison", "chambre d'hôtes", "superhost", "super hôte",
];

function detectType(text: string): ProspectType {
  const lower = text.toLowerCase();

  if (CONCIERGE_KEYWORDS.some((k) => lower.includes(k))) {
    if (AGENCY_KEYWORDS.some((k) => lower.includes(k))) return "agency";
    return "concierge";
  }
  if (AGENCY_KEYWORDS.some((k) => lower.includes(k))) return "agency";
  if (HOST_KEYWORDS.some((k) => lower.includes(k))) return "host_owner";
  return "unknown";
}

function calcPriority(contact: ExtractedContact): Priority {
  // High: has email or phone + relevant content
  if ((contact.email || contact.phone) && contact.relevanceScore >= 2) return "high";
  // Medium: has website or social + some relevance
  if ((contact.instagram || contact.facebook || contact.linkedin) || contact.relevanceScore >= 1)
    return "medium";
  return "low";
}

function calcConfidence(contact: ExtractedContact): Confidence {
  const points = [
    contact.email ? 2 : 0,
    contact.phone ? 2 : 0,
    contact.name ? 1 : 0,
    contact.description ? 1 : 0,
    contact.instagram || contact.facebook ? 1 : 0,
    contact.relevanceScore >= 3 ? 2 : contact.relevanceScore >= 1 ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  if (points >= 5) return "high";
  if (points >= 2) return "medium";
  return "low";
}

export function classifyProspect(
  contact: ExtractedContact,
  params: { city: string; country: string; targetType: string }
): ClassifiedProspect {
  const textForType = [
    contact.name || "",
    contact.description || "",
    contact.website,
  ].join(" ");

  const targetType = detectType(textForType);
  const priority = calcPriority(contact);
  const confidence = calcConfidence(contact);

  const name = contact.name || new URL(contact.website).hostname.replace("www.", "");

  return {
    name,
    city: params.city,
    country: params.country,
    targetType,
    description: contact.description,
    source: "Web Search",
    sourceUrl: contact.sourceUrl,
    website: contact.website,
    email: contact.email,
    phone: contact.phone,
    instagram: contact.instagram,
    facebook: contact.facebook,
    linkedin: contact.linkedin,
    priority,
    confidence,
  };
}

export function deduplicateProspects(
  prospects: ClassifiedProspect[]
): ClassifiedProspect[] {
  const seenDomains = new Set<string>();
  const seenEmails = new Set<string>();

  return prospects.filter((p) => {
    let domain = "";
    try {
      domain = new URL(p.website).hostname.replace("www.", "");
    } catch {
      domain = p.website;
    }

    if (domain && seenDomains.has(domain)) return false;
    if (p.email && seenEmails.has(p.email.toLowerCase())) return false;

    if (domain) seenDomains.add(domain);
    if (p.email) seenEmails.add(p.email.toLowerCase());

    return true;
  });
}
