import type { ScannedSource } from "@/lib/types";

export type LocalScraperResult = {
  url: string;
  title?: string;
  description?: string;
  content?: string;
  links?: { url: string; text: string }[];
  status: "success" | "error" | string;
  error?: string;
};

export type LocalScraperStatus = {
  enabled: boolean;
  baseUrl: string | null;
  legalNotes: string[];
};

const defaultLegalNotes = [
  "Utiliser uniquement des pages publiques ou autorisées.",
  "Ne pas contourner robots.txt, authentification, paywalls ou protections techniques.",
  "Limiter le volume et conserver la traçabilité de l'URL source.",
  "Ne pas collecter de données sensibles inutiles.",
];

export function getLocalScraperStatus(): LocalScraperStatus {
  const enabled = process.env.SCANNER_USE_LOCAL_SCRAPER === "true";
  const baseUrl = process.env.LOCAL_SCRAPER_API_URL || null;
  return { enabled: enabled && Boolean(baseUrl), baseUrl, legalNotes: defaultLegalNotes };
}

export async function scrapePublicUrlWithLocalScraper(url: string, maxDepth = 1): Promise<LocalScraperResult> {
  const status = getLocalScraperStatus();
  if (!status.enabled || !status.baseUrl) {
    return {
      url,
      status: "error",
      error: "Local scraper disabled. Set SCANNER_USE_LOCAL_SCRAPER=true and LOCAL_SCRAPER_API_URL to enable it.",
    };
  }

  const response = await fetch(`${status.baseUrl.replace(/\/$/, "")}/scrape`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, max_depth: maxDepth }),
    cache: "no-store",
  });

  if (!response.ok) {
    return { url, status: "error", error: `Local scraper returned HTTP ${response.status}` };
  }

  return await response.json() as LocalScraperResult;
}

export function normalizeLocalScraperResult(result: LocalScraperResult, scannerRunId = "local_scraper_import"): ScannedSource {
  const text = result.content || result.description || result.title || "";
  const success = result.status === "success";
  const base64Id = Buffer.from(result.url).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "").slice(0, 18);
  return {
    id: `src_local_${base64Id}`,
    scannerRunId,
    sourceType: "local_scraper",
    sourceName: "Local scraper adapter",
    title: result.title || result.url,
    url: result.url,
    snippet: result.description || text.slice(0, 220) || result.error || "No extracted content.",
    extractedText: text,
    authorName: null,
    publishedAt: null,
    relevanceScore: success ? Math.min(95, 55 + Math.round(text.length / 350)) : 0,
    credibilityScore: success ? 62 : 0,
    legalStatus: "requires_permission",
    createdAt: new Date().toISOString(),
  };
}
