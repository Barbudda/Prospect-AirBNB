import type { Signal } from "./types";

const BOOKING_PATTERNS = [
  /calendly\.com/i, /doctolib\.fr/i, /opentable\.com/i, /lafourchette\.com/i,
  /thefork\.com/i, /widget\.booking\.com/i,
  /r[ée]server\s+en\s+ligne/i, /book\s+online/i, /réservation\s+en\s+ligne/i,
  /réserver\s+maintenant/i, /prendre\s+rendez-vous/i, /book\s+now/i,
];

const CONTACT_FORM_PATTERNS = [
  /class="[^"]*contact[^"]*form/i, /id="[^"]*contact[^"]*form/i,
  /<form[^>]*(contact|nous)[^>]*>/i,
];

const OUTDATED_PATTERNS = [
  /copyright\s+20(0\d|1[0-4])/i, /flash\s+player/i, /adobe\s+flash/i,
];

const HIRING_PATTERNS = [
  /nous\s+recrutons/i, /on\s+recrute/i, /offre\s+d.emploi/i,
  /join\s+our\s+team/i, /rejoignez[-\s]nous/i, /we.re\s+hiring/i,
];

const AIRBNB_PATTERNS = [
  /airbnb/i, /location\s+courte\s+dur[ée]/i, /conciergerie/i,
  /gestion\s+locative/i, /property\s+manag/i, /short[-\s]term\s+rental/i,
  /meublé\s+touristique/i,
];

const RESTAURANT_PATTERNS = [
  /\bmenu\b/i, /carte\s+des\s+plats/i, /livraison\b/i,
  /click\s+and\s+collect/i, /uber\s+eats/i, /deliveroo/i,
];

const NO_CTA_SIGNALS = [
  /contactez[-\s]nous/i, /appelez[-\s]nous/i, /call\s+us/i,
];

export function extractSignals(
  html: string,
  text: string,
  context: { industry?: string }
): Signal[] {
  const signals: Signal[] = [];

  // Online booking
  const hasBooking = BOOKING_PATTERNS.some((p) => p.test(html) || p.test(text));
  if (hasBooking) {
    signals.push({ type: "booking_system", label: "Online booking system found", confidence: "high" });
  } else {
    signals.push({ type: "no_booking_system", label: "No online booking detected", confidence: "medium" });
  }

  // Contact form
  if (CONTACT_FORM_PATTERNS.some((p) => p.test(html))) {
    signals.push({ type: "contact_form", label: "Contact form present", confidence: "medium" });
  }

  // Outdated
  if (OUTDATED_PATTERNS.some((p) => p.test(html))) {
    signals.push({ type: "outdated_website", label: "Website appears outdated", confidence: "low" });
  }

  // Hiring
  if (HIRING_PATTERNS.some((p) => p.test(text))) {
    signals.push({ type: "hiring", label: "Business is hiring", confidence: "medium" });
  }

  // Airbnb/rental relevance
  if (AIRBNB_PATTERNS.some((p) => p.test(text))) {
    signals.push({ type: "airbnb_relevant", label: "Airbnb/rental market content", confidence: "high" });
  }

  // CTA presence
  if (NO_CTA_SIGNALS.some((p) => p.test(text))) {
    signals.push({ type: "phone_cta", label: "Phone contact only (no digital booking)", confidence: "medium" });
  }

  // Industry-specific
  const industry = context.industry || "";

  if (industry === "restaurant" || RESTAURANT_PATTERNS.some((p) => p.test(text))) {
    if (!hasBooking) {
      signals.push({ type: "restaurant_no_booking", label: "Restaurant without online booking", confidence: "high" });
    }
  }

  if (/menu\s+pdf/i.test(html)) {
    signals.push({ type: "pdf_menu", label: "PDF menu (outdated practice)", confidence: "medium" });
  }

  return signals;
}
