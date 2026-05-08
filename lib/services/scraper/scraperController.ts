import { buildSearchPlan } from "./searchPlanner";
import { getBestProvider } from "./providers";
import { crawlWebsites } from "./websiteCrawler";
import { extractContactInfo } from "../contactExtractor";
import { extractSignals } from "./signalExtractor";
import { detectTechnologies } from "./technologyDetector";
import { scoreLead } from "./leadScorer";
import { deduplicateLeads } from "./deduplicationService";
import {
  createScrapeRun,
  updateScrapeRun,
  saveLeads,
  appendScrapeLog,
} from "./persistenceService";
import type {
  ScraperInput,
  ProgressEvent,
  ScraperStats,
  ExtractedLead,
  ScoredLead,
} from "./types";

const RELEVANCE_KEYWORDS = [
  "airbnb", "location courte durée", "conciergerie", "gestion locative",
  "property management", "short-term rental", "vacation rental",
  "restaurant", "café", "brasserie", "hotel", "hôtel", "hébergement",
  "immobilier", "dentiste", "médecin", "salle de sport", "gym", "fitness",
  "booking", "réservation", "menu", "contact",
];

function scoreRelevance(text: string, targetDescription: string): number {
  const lower = text.toLowerCase();
  const targetWords = targetDescription.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
  let score = 0;
  for (const kw of RELEVANCE_KEYWORDS) {
    if (lower.includes(kw)) score++;
  }
  for (const word of targetWords) {
    if (lower.includes(word)) score++;
  }
  return score;
}

export async function runScraper(
  input: ScraperInput,
  onEvent: (event: ProgressEvent) => void
): Promise<void> {
  const maxResults = Math.min(input.maxResults || 30, 50);
  const maxPagesPerSite = Math.min(input.maxPagesPerSite || 3, 5);

  const stats: ScraperStats = {
    queriesRun: 0,
    urlsFound: 0,
    pagesAnalyzed: 0,
    leadsFound: 0,
    leadsSaved: 0,
    duplicatesSkipped: 0,
    errors: 0,
  };

  const log = (level: "info" | "warning" | "error" | "success", message: string) => {
    onEvent({ type: "log", level, message });
  };

  const progress = (stage: string, message: string) => {
    onEvent({ type: "progress", stage, message, stats: { ...stats } });
  };

  const provider = getBestProvider();
  let scrapeRunId: string | null = null;

  try {
    scrapeRunId = await createScrapeRun({
      targetDescription: input.targetDescription,
      location: input.location,
      country: input.country,
      industry: input.industry,
      keywords: input.keywords,
      negativeKeywords: input.negativeKeywords,
      sourcesUsed: provider.name,
      maxResults,
      maxPagesPerSite,
    });
  } catch {
    log("warning", "Could not create scrape run record in database");
  }

  // 1. Build plan
  progress("planning", "Building search plan...");
  const plan = buildSearchPlan({
    targetDescription: input.targetDescription,
    location: input.location,
    country: input.country,
    industry: input.industry,
    keywords: input.keywords,
    language: input.language || "fr",
  });
  log("info", `${plan.queries.length} queries planned · Provider: ${provider.name} · Industry: ${plan.detectedIndustry}`);

  if (!provider.isConfigured && provider.id === "duckduckgo") {
    log("info", "Using DuckDuckGo (free). Add SERPAPI_API_KEY or BRAVE_SEARCH_API_KEY to .env for better results.");
  }

  // 2. Search
  const allUrls = new Map<string, string>();

  for (const query of plan.queries) {
    progress("searching", `Searching: "${query}"`);
    log("info", `Searching: "${query}"`);

    try {
      const results = await provider.search(query, plan.language);
      stats.queriesRun++;

      let added = 0;
      for (const r of results) {
        if (!r.url.startsWith("http") || allUrls.has(r.url)) continue;
        if (input.negativeKeywords) {
          const negKws = input.negativeKeywords.toLowerCase().split(/[\s,]+/).filter(Boolean);
          const combined = (r.title + " " + r.snippet).toLowerCase();
          if (negKws.some((kw) => combined.includes(kw))) continue;
        }
        allUrls.set(r.url, r.title);
        added++;
      }

      log("success", `"${query}" → ${results.length} results (${added} new URLs)`);
    } catch (e) {
      stats.errors++;
      log("error", `Search failed: ${e instanceof Error ? e.message : "Unknown error"}`);
    }

    await new Promise((r) => setTimeout(r, 400));
  }

  stats.urlsFound = allUrls.size;

  if (allUrls.size === 0) {
    log("warning", "No URLs found. Try different keywords or check your search provider configuration.");
    if (scrapeRunId) {
      await updateScrapeRun(scrapeRunId, { status: "completed", completedAt: new Date(), errors: "No URLs found" });
    }
    onEvent({ type: "complete", stats, scrapeRunId: scrapeRunId || undefined });
    return;
  }

  log("info", `${allUrls.size} unique URLs collected`);

  // 3. Crawl
  const urlsToScrape = Array.from(allUrls.keys()).slice(0, maxResults * 2);
  progress("crawling", `Crawling ${urlsToScrape.length} websites...`);

  const crawlResults = await crawlWebsites(urlsToScrape, maxPagesPerSite, (done, total, url) => {
    stats.pagesAnalyzed = done;
    progress("crawling", `Crawling ${done}/${total}...`);
    if (scrapeRunId) {
      appendScrapeLog(scrapeRunId, "info", `Crawled: ${url}`).catch(() => {});
    }
  });

  log("info", `Crawled ${crawlResults.length} domains`);

  // 4. Extract
  progress("extracting", "Extracting contacts and signals...");

  const extractedLeads: ScoredLead[] = [];

  for (const { url, pages } of crawlResults) {
    if (pages.length === 0) {
      stats.errors++;
      continue;
    }

    const combinedText = pages.map((p) => `${p.title} ${p.description} ${p.text}`).join(" ");
    const combinedHtml = pages.map((p) => p.html).join("\n");
    const primaryPage = pages[0];

    const relevanceScore = scoreRelevance(combinedText, input.targetDescription);
    if (relevanceScore < 1) continue;

    const contactData = extractContactInfo(primaryPage);
    const signals = extractSignals(combinedHtml, combinedText, { industry: input.industry });
    const technologyStack = detectTechnologies(combinedHtml);

    const lead: ExtractedLead = {
      name: contactData.name,
      description: contactData.description,
      address: null,
      email: contactData.email,
      phone: contactData.phone,
      website: contactData.website,
      sourceUrl: url,
      instagram: contactData.instagram,
      facebook: contactData.facebook,
      linkedin: contactData.linkedin,
      tiktok: null,
      twitter: null,
      signals,
      technologyStack,
      isRelevant: true,
      relevanceScore,
    };

    const scored = scoreLead(lead);
    extractedLeads.push(scored);

    const hasContact = contactData.email || contactData.phone;
    log(
      hasContact ? "success" : "info",
      `${url} → ${hasContact ? [contactData.email, contactData.phone].filter(Boolean).join(", ") : "no direct contact"}`
    );
  }

  stats.leadsFound = extractedLeads.length;
  log("info", `${extractedLeads.length} relevant leads before deduplication`);

  // 5. Deduplicate
  progress("deduplicating", "Removing duplicates...");
  const { unique, duplicatesCount } = deduplicateLeads(extractedLeads);
  stats.duplicatesSkipped = duplicatesCount;

  if (duplicatesCount > 0) log("info", `${duplicatesCount} duplicate(s) merged or removed`);

  const finalLeads = unique.slice(0, maxResults);

  // 6. Save
  progress("saving", `Saving ${finalLeads.length} leads...`);

  if (scrapeRunId && finalLeads.length > 0) {
    const { saved, merged } = await saveLeads(finalLeads, scrapeRunId, {
      city: input.location,
      country: input.country,
      industry: input.industry,
    });
    stats.leadsSaved = saved;
    stats.duplicatesSkipped += merged;
    log("success", `${saved} new leads saved. ${merged} existing records updated.`);
  } else if (finalLeads.length === 0) {
    log("warning", "No real leads found for this search. Try broader keywords or a different location.");
  }

  // Finalize
  if (scrapeRunId) {
    await updateScrapeRun(scrapeRunId, {
      status: "completed",
      completedAt: new Date(),
      pagesAnalyzed: stats.pagesAnalyzed,
      leadsFound: stats.leadsFound,
      leadsSaved: stats.leadsSaved,
    });
    await appendScrapeLog(scrapeRunId, "success", `Completed: ${stats.leadsSaved} leads saved, ${stats.pagesAnalyzed} pages analyzed`);
  }

  onEvent({ type: "complete", stats, scrapeRunId: scrapeRunId || undefined });
}
