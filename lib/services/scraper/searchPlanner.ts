export type SearchPlan = {
  queries: string[];
  language: string;
  detectedIndustry: string;
};

export type PlanInput = {
  targetDescription: string;
  location: string;
  country: string;
  industry?: string;
  keywords?: string;
  negativeKeywords?: string;
  language?: string;
};

const INDUSTRY_TEMPLATES: Record<string, string[]> = {
  restaurant: [
    "{desc} {location}",
    "restaurant {location} contact email",
    "restaurant {location} sans réservation en ligne",
    "restaurant {location} numéro téléphone site web",
    "{desc} {location} email contact",
  ],
  hotel: [
    "{desc} {location}",
    "hôtel {location} contact email",
    "hébergement {location} réservation directe",
    "{desc} {location} email réception",
  ],
  concierge: [
    "conciergerie airbnb {location} contact",
    "gestion locative {location} email",
    "conciergerie location courte durée {location}",
    "property management {location} contact",
    "{desc} {location} email",
  ],
  real_estate: [
    "agence immobilière {location} contact",
    "agent immobilier {location} email",
    "{desc} {location} contact",
    "immobilier {location} site web email",
  ],
  dentist: [
    "dentiste {location} cabinet contact",
    "cabinet dentaire {location} email",
    "{desc} {location} sans prise de rdv en ligne",
    "dentiste {location} rdv téléphone",
  ],
  gym: [
    "salle de sport {location} contact email",
    "fitness {location} inscription",
    "{desc} {location} contact",
  ],
  ecommerce: [
    "{desc} {location} boutique en ligne",
    "{desc} {location} contact email",
    "commerce {location} vente en ligne",
  ],
  default: [
    "{desc} {location}",
    "{desc} {location} contact",
    "{desc} {location} email site web",
    "{desc} {location} numéro de téléphone",
  ],
};

function detectIndustry(description: string, explicit?: string): string {
  if (explicit) return explicit;
  const lower = description.toLowerCase();
  if (/restaurant|brasserie|bistrot|café|traiteur|pizzeria|bar\b/.test(lower)) return "restaurant";
  if (/hôtel|hotel|hébergement|bed and breakfast|b&b|auberge/.test(lower)) return "hotel";
  if (/concierg|airbnb|location courte|property manag|gestion locative|meublé touristique/.test(lower)) return "concierge";
  if (/immobilier|agence immo|agent immo|real estate|promoteur/.test(lower)) return "real_estate";
  if (/dentist|cabinet dentaire|orthodont/.test(lower)) return "dentist";
  if (/salle de sport|gym|fitness|musculation|crossfit/.test(lower)) return "gym";
  if (/boutique|e-commerce|ecommerce|shop|vente en ligne/.test(lower)) return "ecommerce";
  return "default";
}

export function buildSearchPlan(input: PlanInput): SearchPlan {
  const { targetDescription, location, keywords, language = "fr" } = input;
  const detectedIndustry = detectIndustry(targetDescription, input.industry);
  const templates = INDUSTRY_TEMPLATES[detectedIndustry] || INDUSTRY_TEMPLATES.default;

  const queries = new Set<string>();

  for (const tpl of templates) {
    const q = tpl
      .replace("{desc}", targetDescription)
      .replace("{location}", location)
      .trim();
    queries.add(q);
  }

  if (keywords) {
    queries.add(`${keywords} ${location} contact`);
    queries.add(`${targetDescription} ${keywords} ${location}`);
  }

  return {
    queries: Array.from(queries).slice(0, 6),
    language,
    detectedIndustry,
  };
}
