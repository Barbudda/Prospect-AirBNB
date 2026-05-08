import type { LocationContext, PropertyContext, Prospect, ScannedSource, ScannerInsight } from "@/lib/types";
import { getLocationContextByCity, getPropertyContextByProspectId } from "@/lib/scanner-mock-data";

const guestPainTaxonomy = [
  "check-in", "clés", "serrure", "Wi-Fi", "chauffage", "climatisation", "parking", "bruit", "ménage", "équipements", "règles maison", "check-out", "bagages", "restaurants", "transport", "urgence", "langue", "météo", "accessibilité",
];

const ownerPainTaxonomy = [
  "messages répétitifs", "livret non lu", "disponibilité 24h/24", "multi-logements", "mauvaise notation", "standardisation", "multilingue", "perte de temps", "arrivée tardive", "coordination ménage", "upsell non exploité", "absence de données FAQ",
];

export function detectPainPointsFromText(text: string) {
  const haystack = text.toLowerCase();
  const guestPainPoints = guestPainTaxonomy.filter((keyword) => haystack.includes(keyword.toLowerCase()));
  const ownerPainPoints = ownerPainTaxonomy.filter((keyword) => haystack.includes(keyword.toLowerCase()));
  return {
    guestPainPoints: guestPainPoints.length ? guestPainPoints : ["questions voyageurs répétitives"],
    ownerPainPoints: ownerPainPoints.length ? ownerPainPoints : ["perte de temps support"],
    intensity: Math.min(100, 45 + guestPainPoints.length * 8 + ownerPainPoints.length * 10),
  };
}

export function classifyPropertyContext(text: string): Partial<PropertyContext> {
  const haystack = text.toLowerCase();
  if (haystack.includes("chalet") || haystack.includes("ski") || haystack.includes("neige")) {
    return {
      propertyType: "chalet montagne",
      locationType: "montagne",
      premiumLevel: "medium",
      accessComplexity: 86,
      weatherSensitivity: 94,
      seasonality: "hiver et vacances ski",
      guestProfile: "skieurs internationaux, familles, groupes",
      operationalRisks: ["neige", "chauffage", "accès nuit", "parking", "équipement ski"],
      likelyQuestions: ["Faut-il des chaînes ?", "Comment accéder s'il neige ?", "Où louer les skis ?"],
      recommendedConciergeFeatures: ["FAQ ski", "assistant multilingue", "météo locale", "instructions accès neige"],
      confidenceScore: 90,
    };
  }
  if (haystack.includes("villa") || haystack.includes("piscine") || haystack.includes("premium")) {
    return {
      propertyType: "villa premium proche mer",
      locationType: "mer premium",
      premiumLevel: "high",
      accessComplexity: 78,
      weatherSensitivity: 72,
      seasonality: "saison estivale",
      guestProfile: "familles, groupes premium, internationaux",
      operationalRisks: ["climatisation", "parking", "piscine", "demandes VIP", "arrivées tardives"],
      likelyQuestions: ["Où stationner ?", "Comment utiliser la piscine ?", "Quels services premium réserver ?"],
      recommendedConciergeFeatures: ["FAQ équipements", "upsell transferts", "recommandations premium", "QR code"],
      confidenceScore: 87,
    };
  }
  if (haystack.includes("studio") || haystack.includes("métro") || haystack.includes("ascenseur")) {
    return {
      propertyType: "studio urbain",
      locationType: "centre-ville",
      premiumLevel: "medium",
      accessComplexity: 74,
      weatherSensitivity: 42,
      seasonality: "demande continue",
      guestProfile: "couples, voyageurs business, étrangers",
      operationalRisks: ["codes", "ascenseur", "bruit", "règlement copropriété", "métro"],
      likelyQuestions: ["Quel métro prendre ?", "Y a-t-il un ascenseur ?", "Comment utiliser les codes ?"],
      recommendedConciergeFeatures: ["check-in autonome", "guide transport", "règles copropriété", "FAQ courte"],
      confidenceScore: 78,
    };
  }
  return {
    propertyType: "appartement courte durée",
    locationType: "urbain ou touristique",
    premiumLevel: "medium",
    accessComplexity: 62,
    weatherSensitivity: 55,
    seasonality: "variable",
    guestProfile: "voyageurs loisirs et courts séjours",
    operationalRisks: ["check-in", "Wi-Fi", "règles maison", "recommandations locales"],
    likelyQuestions: ["Comment accéder au logement ?", "Quel est le Wi-Fi ?", "Où manger ?"],
    recommendedConciergeFeatures: ["FAQ arrivée", "QR code", "recommandations locales"],
    confidenceScore: 68,
  };
}

export function inferGeographicNeeds(location: { city: string; country: string; neighborhood?: string }) {
  const existing = getLocationContextByCity(location.city);
  if (existing) return existing;

  const now = new Date().toISOString();
  const coastal = ["nice", "biarritz", "marseille", "bordeaux"].includes(location.city.toLowerCase());
  return {
    id: `locctx_${location.city.toLowerCase()}`,
    city: location.city,
    country: location.country,
    neighborhood: location.neighborhood ?? null,
    climateType: coastal ? "côtier ou touristique" : "urbain tempéré",
    tourismType: coastal ? "loisirs, mer, international" : "urbain, business, culture",
    seasonality: coastal ? "saison estivale forte" : "demande régulière",
    transportContext: coastal ? "voiture et stationnement" : "transports publics et marche",
    parkingDifficulty: coastal ? "high" : "medium",
    weatherRisks: coastal ? ["chaleur", "pluie", "vent"] : ["pluie", "canicule ponctuelle"],
    localActivities: coastal ? ["plage", "restaurants", "activités nautiques"] : ["restaurants", "musées", "événements"],
    commonGuestQuestions: coastal ? ["Où se garer ?", "Quelle plage choisir ?", "Où réserver ?"] : ["Comment venir ?", "Quel quartier ?", "Où manger ?"],
    upsellOpportunities: coastal ? ["transfert", "activités", "restaurants", "late checkout"] : ["transport", "bagagerie", "restaurants", "visites"],
    operationalConstraints: coastal ? ["parking", "saison", "arrivées tardives"] : ["transport", "bruit", "check-in"],
    createdAt: now,
    updatedAt: now,
  } satisfies LocationContext;
}

export function inferGuestQuestions(propertyContext: Partial<PropertyContext>, locationContext: LocationContext) {
  return [...(propertyContext.likelyQuestions ?? []), ...locationContext.commonGuestQuestions].slice(0, 8);
}

export function inferOwnerPainPoints(propertyContext: Partial<PropertyContext>, sourceSignals: string[]) {
  const base = ["messages répétitifs", "standardisation des réponses", "support hors horaires"];
  if ((propertyContext.accessComplexity ?? 0) > 75) base.push("arrivées complexes");
  if ((propertyContext.weatherSensitivity ?? 0) > 80) base.push("questions météo et accès");
  if (sourceSignals.some((signal) => signal.toLowerCase().includes("upsell"))) base.push("upsell non exploité");
  return [...new Set(base)];
}

export function recommendConciergeFeatures(analysis: { propertyContext: Partial<PropertyContext>; locationContext: LocationContext; painPoints: string[] }) {
  const features = ["QR code", "FAQ multilingue", "instructions d'arrivée", ...analysis.locationContext.upsellOpportunities.map((item) => `upsell ${item}`), ...(analysis.propertyContext.recommendedConciergeFeatures ?? [])];
  return [...new Set(features)].slice(0, 8);
}

export function generateOutreachFromInsights(prospect: Prospect, insights: ScannerInsight[]) {
  const angle = insights[0]?.outreachAngle ?? prospect.outreachAngle;
  return `Bonjour ${prospect.name}, nous avons identifié un angle très concret pour ${prospect.city} : ${angle}. Prospect peut préparer un majordome IA par QR code avec vos consignes, FAQ et recommandations locales afin de réduire les messages répétitifs et améliorer l'expérience voyageur.`;
}

export function scoreLeadWithScannerData(prospect: Prospect, scannerData: { insights: ScannerInsight[]; propertyContext?: PropertyContext | null; locationContext?: LocationContext | null }) {
  const highSeverity = scannerData.insights.filter((insight) => insight.severity === "high").length;
  const avgConfidence = scannerData.insights.length ? Math.round(scannerData.insights.reduce((sum, insight) => sum + insight.confidenceScore, 0) / scannerData.insights.length) : 65;
  const locationComplexityScore = scannerData.locationContext?.parkingDifficulty === "high" ? 88 : 68;
  const propertyComplexityScore = scannerData.propertyContext?.accessComplexity ?? 64;
  const guestQuestionPotentialScore = Math.min(100, 62 + scannerData.insights.length * 8 + highSeverity * 8);
  const automationNeedScore = Math.min(100, Math.round((guestQuestionPotentialScore + propertyComplexityScore + prospect.conciergeNeedScore) / 3));
  const upsellPotentialScore = Math.min(100, 55 + (scannerData.locationContext?.upsellOpportunities.length ?? 2) * 8);
  const operationalPainScore = Math.min(100, 58 + highSeverity * 14 + scannerData.insights.length * 5);
  const outreachPersonalizationScore = Math.min(100, Math.round((avgConfidence + prospect.contactabilityScore + scannerData.insights.length * 6) / 1.25));
  const globalScore = Math.min(100, Math.round((prospect.globalScore * 0.35 + automationNeedScore * 0.25 + operationalPainScore * 0.2 + upsellPotentialScore * 0.1 + prospect.contactabilityScore * 0.1)));

  return {
    globalScore,
    locationComplexityScore,
    propertyComplexityScore,
    guestQuestionPotentialScore,
    automationNeedScore,
    upsellPotentialScore,
    operationalPainScore,
    outreachPersonalizationScore,
    scannerConfidenceScore: avgConfidence,
  };
}

export function analyzeSourceWithAI(source: ScannedSource) {
  const pain = detectPainPointsFromText(source.extractedText);
  const propertyContext = classifyPropertyContext(source.extractedText);
  const locationContext = inferGeographicNeeds({ city: source.title.includes("Chamonix") ? "Chamonix" : source.title.includes("Paris") ? "Paris" : "Biarritz", country: "France" });
  return {
    sourceId: source.id,
    sourceType: source.sourceType,
    pain,
    propertyContext,
    locationContext,
    reusableCommercialValue: Math.min(100, Math.round((source.relevanceScore + source.credibilityScore + pain.intensity) / 3)),
  };
}

export function getProspectScannerAnalysis(prospect: Prospect) {
  const propertyContext = getPropertyContextByProspectId(prospect.id) ?? classifyPropertyContext(`${prospect.listingTitle} ${prospect.aiSummary}`);
  const locationContext = getLocationContextByCity(prospect.city) ?? inferGeographicNeeds({ city: prospect.city, country: prospect.country });
  const guestQuestions = inferGuestQuestions(propertyContext, locationContext);
  const ownerPainPoints = inferOwnerPainPoints(propertyContext, prospect.painSignals.map((signal) => signal.label));
  return {
    propertyContext,
    locationContext,
    guestQuestions,
    ownerPainPoints,
    recommendedFeatures: recommendConciergeFeatures({ propertyContext, locationContext, painPoints: ownerPainPoints }),
  };
}
