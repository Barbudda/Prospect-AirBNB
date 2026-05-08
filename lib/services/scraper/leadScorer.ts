import type { ExtractedLead, ScoredLead } from "./types";

export function scoreLead(lead: ExtractedLead): ScoredLead {
  const reasons: string[] = [];
  let priorityScore = 0;
  let confidenceScore = 0;

  if (lead.email) {
    priorityScore += 3;
    confidenceScore += 3;
    reasons.push("Email address found");
  }
  if (lead.phone) {
    priorityScore += 2;
    confidenceScore += 2;
    reasons.push("Phone number found");
  }
  if (lead.website) {
    confidenceScore += 1;
    reasons.push("Website exists");
  }

  const socialCount = [lead.instagram, lead.facebook, lead.linkedin, lead.tiktok, lead.twitter].filter(Boolean).length;
  if (socialCount > 0) {
    confidenceScore += 1;
    reasons.push(`${socialCount} social profile${socialCount > 1 ? "s" : ""} found`);
  } else {
    reasons.push("No social profiles found");
  }

  const hasBooking = lead.signals.some((s) => s.type === "booking_system");
  const noBooking = lead.signals.some((s) => s.type === "no_booking_system");
  const isAirbnbRelevant = lead.signals.some((s) => s.type === "airbnb_relevant");
  const isOutdated = lead.signals.some((s) => s.type === "outdated_website");

  if (noBooking && (lead.email || lead.phone)) {
    priorityScore += 2;
    reasons.push("No booking system — clear opportunity");
  }
  if (hasBooking) {
    reasons.push("Already has online booking");
  }
  if (isAirbnbRelevant) {
    priorityScore += 2;
    confidenceScore += 1;
    reasons.push("Airbnb/rental market relevant");
  }
  if (isOutdated) {
    priorityScore += 1;
    reasons.push("Outdated website detected");
  }
  if (lead.relevanceScore >= 3) {
    priorityScore += 1;
    confidenceScore += 1;
    reasons.push("Highly relevant to search target");
  } else if (lead.relevanceScore >= 1) {
    reasons.push("Moderately relevant");
  }
  if (lead.description) confidenceScore += 1;
  if (lead.name) confidenceScore += 1;

  const priority: "high" | "medium" | "low" =
    priorityScore >= 6 ? "high" : priorityScore >= 3 ? "medium" : "low";

  const confidence: "high" | "medium" | "low" =
    confidenceScore >= 6 ? "high" : confidenceScore >= 3 ? "medium" : "low";

  // Angle and next action
  let angle: string | null = null;
  let nextAction = "Manually verify contact details";

  if (noBooking && (lead.email || lead.phone)) {
    angle = "No online booking detected — potential to help simplify customer inquiries or reservations.";
  } else if (isAirbnbRelevant && !lead.email && !lead.phone) {
    angle = "Airbnb/rental business found. Contact info missing — check contact page or LinkedIn.";
  } else if (lead.email) {
    angle = "Direct email contact available.";
  } else if (isOutdated) {
    angle = "Outdated website — potential web modernization angle.";
  }

  if (lead.email) nextAction = "Send personalized email";
  else if (lead.phone) nextAction = "Call or send SMS";
  else if (lead.instagram || lead.facebook) nextAction = "Send DM on social media";
  else if (lead.website) nextAction = "Manually check contact page";

  return { ...lead, priority, confidence, reasons, angle, nextAction };
}
