import type { PainSignal, Prospect } from "@/lib/types";

export type RawLeadData = {
  name?: string;
  city: string;
  country: string;
  sourceUrl?: string;
  sourceName?: string;
  texts: string[];
  estimatedProperties?: number;
  website?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
};

const painKeywords = [
  { type: "check_in", label: "Problème de check-in", keywords: ["check-in", "arrivée", "clés", "boîte à clés", "accès tardif"] },
  { type: "wifi", label: "Question Wi-Fi probable", keywords: ["wifi", "wi-fi", "internet", "connexion"] },
  { type: "communication", label: "Communication lente", keywords: ["communication", "réponse lente", "pas de réponse", "host absent"] },
  { type: "instructions", label: "Instructions insuffisantes", keywords: ["instructions", "consignes", "difficile à trouver", "adresse"] },
  { type: "cleaning", label: "Ménage sensible", keywords: ["ménage", "propreté", "serviette", "drap"] },
  { type: "local_recommendations", label: "Recommandations locales manquantes", keywords: ["restaurant", "activité", "recommandation", "quartier"] },
  { type: "multilingual", label: "Besoin multilingue", keywords: ["english", "anglais", "international", "spanish", "deutsch", "italian"] },
];

export async function analyzeProspect(rawData: RawLeadData) {
  const painSignals = detectPainSignals(rawData.texts, "raw_generated", rawData.sourceName ?? "Source publique");
  const baseScore = scoreProspect({
    estimatedProperties: rawData.estimatedProperties ?? 1,
    contactEmail: rawData.contactEmail ?? null,
    contactPhone: rawData.contactPhone ?? null,
    website: rawData.website ?? null,
    painSignals,
    tags: rawData.texts.join(" ").toLowerCase().includes("conciergerie") ? ["conciergerie"] : [],
    digitalMaturityScore: rawData.website ? 62 : 38,
  });

  return {
    ...rawData,
    painSignals,
    globalScore: baseScore.globalScore,
    conciergeNeedScore: baseScore.conciergeNeedScore,
    summary: summarizeProspect({ name: rawData.name ?? "Lead", city: rawData.city, painSignals, estimatedProperties: rawData.estimatedProperties ?? 1 }),
    nextAction: recommendNextAction({ globalScore: baseScore.globalScore, contactEmail: rawData.contactEmail ?? null, contactPhone: rawData.contactPhone ?? null }),
  };
}

export function scoreProspect(prospect: Pick<Prospect, "estimatedProperties" | "contactEmail" | "contactPhone" | "website" | "painSignals" | "tags" | "digitalMaturityScore">) {
  let score = 30;
  let conciergeNeedScore = 35;

  if (prospect.estimatedProperties >= 2) score += 20;
  if (prospect.estimatedProperties >= 10) score += 10;
  if (prospect.tags.includes("conciergerie")) score += 25;
  if (prospect.tags.includes("premium") || prospect.tags.includes("forte valeur nuit")) score += 10;
  if (prospect.website && prospect.digitalMaturityScore < 75) score += 15;
  if (prospect.contactEmail || prospect.contactPhone) score += 10;

  const severeSignals = prospect.painSignals.filter((signal) => signal.severity === "high").length;
  const mediumSignals = prospect.painSignals.filter((signal) => signal.severity === "medium").length;
  score += Math.min(20, severeSignals * 10 + mediumSignals * 5);
  conciergeNeedScore += Math.min(35, severeSignals * 12 + mediumSignals * 7 + prospect.estimatedProperties * 2);

  if (prospect.tags.includes("concurrent détecté")) score -= 10;

  return {
    globalScore: Math.max(0, Math.min(100, Math.round(score))),
    conciergeNeedScore: Math.max(0, Math.min(100, Math.round(conciergeNeedScore))),
  };
}

export function detectPainSignals(texts: string[], prospectId = "generated", source = "Texte public"): PainSignal[] {
  const haystack = texts.join(" ").toLowerCase();
  return painKeywords
    .filter((rule) => rule.keywords.some((keyword) => haystack.includes(keyword)))
    .map((rule, index) => ({
      id: `sig_${prospectId}_${index}`,
      prospectId,
      type: rule.type,
      label: rule.label,
      severity: rule.type === "check_in" || rule.type === "communication" ? "high" : "medium",
      evidence: `Motifs détectés dans les textes publics : ${rule.keywords.filter((keyword) => haystack.includes(keyword)).join(", ")}.`,
      source,
      createdAt: new Date().toISOString(),
    }));
}

export function generateOutreach(prospect: Prospect) {
  const mainPain = prospect.painSignals[0]?.label.toLowerCase() ?? "questions répétitives des voyageurs";
  return {
    angle: `Automatiser ${mainPain} avec un majordome IA accessible par QR code.`,
    email: `Bonjour ${prospect.name}, votre activité à ${prospect.city} semble présenter un bon potentiel pour automatiser les échanges voyageurs. Nous avons créé un majordome IA qui répond 24h/24 à partir de vos consignes, livrets et recommandations locales. Est-ce que je peux vous montrer une démo adaptée à ${prospect.estimatedProperties} bien${prospect.estimatedProperties > 1 ? "s" : ""} ?`,
    linkedin: `Bonjour ${prospect.name}, je pense que votre activité courte durée à ${prospect.city} pourrait gagner du temps avec un majordome IA voyageur par QR code. Ouvert à voir un exemple ?`,
    callScript: `Présenter le constat, citer ${mainPain}, proposer une démo de 10 minutes et insister sur le fait que l'assistant utilise uniquement leurs propres documents.`,
  };
}

export function summarizeProspect(prospect: Pick<Prospect, "name" | "city" | "estimatedProperties" | "painSignals">) {
  const painSummary = prospect.painSignals.map((signal) => signal.label).join(", ") || "peu de signaux publics explicites";
  return `${prospect.name} opère à ${prospect.city} avec environ ${prospect.estimatedProperties} bien(s). Les signaux détectés indiquent : ${painSummary}. Le cas d'usage prioritaire est d'automatiser les réponses voyageurs et de préparer un livret IA actionnable.`;
}

export function recommendNextAction(prospect: Pick<Prospect, "globalScore" | "contactEmail" | "contactPhone">) {
  if (prospect.globalScore >= 85 && prospect.contactEmail) return "Envoyer un email personnalisé avec une démo contextualisée.";
  if (prospect.globalScore >= 75 && prospect.contactPhone) return "Appeler avec un angle opérationnel clair puis envoyer un exemple.";
  if (prospect.globalScore >= 70) return "Enrichir les coordonnées publiques avant contact.";
  return "Surveiller ou classer en nurturing, sauf signal de douleur supplémentaire.";
}

export function estimateConciergeFit(prospect: Prospect) {
  const factors = [prospect.conciergeNeedScore, prospect.globalScore, prospect.estimatedProperties >= 2 ? 85 : 65, prospect.painSignals.length > 1 ? 88 : 62];
  return Math.round(factors.reduce((sum, value) => sum + value, 0) / factors.length);
}
