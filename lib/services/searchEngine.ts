import { searchWeb } from "./webSearch";
import { scrapePages } from "./pageScraper";
import { extractContactInfo } from "./contactExtractor";
import { classifyProspect, deduplicateProspects } from "./prospectClassifier";
import { prisma } from "../prisma";

export type SearchParams = {
  city: string;
  country: string;
  targetType: string; // "all" | "concierge" | "host" | "property_manager"
  keywords?: string;
  maxResults?: number;
  sources?: string[];
};

export type ProgressEvent =
  | { type: "progress"; stage: string; message: string; [key: string]: unknown }
  | { type: "complete"; contactsFound: number; pagesAnalyzed: number }
  | { type: "error"; message: string };

function buildSearchQueries(params: SearchParams): string[] {
  const { city, country, targetType, keywords } = params;
  const loc = `${city} ${country}`;

  const baseQueries: string[] = [];

  const isConcierge = targetType === "concierge" || targetType === "all";
  const isHost = targetType === "host" || targetType === "all";
  const isManager = targetType === "property_manager" || targetType === "all";

  if (isConcierge) {
    baseQueries.push(
      `conciergerie airbnb ${city}`,
      `conciergerie location courte durée ${city} contact`,
      `gestion locative airbnb ${city} email`,
    );
  }

  if (isManager) {
    baseQueries.push(
      `property manager airbnb ${loc} contact`,
      `gestion saisonnière ${city} location`,
    );
  }

  if (isHost) {
    baseQueries.push(
      `hôte airbnb ${city} contact site web`,
      `location vacances ${city} gestionnaire contact`,
    );
  }

  // Always add a general query
  baseQueries.push(`conciergerie location courte durée ${city}`);

  if (keywords) {
    baseQueries.push(`${keywords} ${city} airbnb contact`);
  }

  // Limit to 5 queries to avoid rate limiting
  return baseQueries.slice(0, 5);
}

function getSourceLabel(): string {
  const hasSerpapi = !!process.env.SERPAPI_API_KEY;
  return hasSerpapi ? "SerpAPI + Web" : "DuckDuckGo";
}

export async function runSearch(
  params: SearchParams,
  onProgress: (event: ProgressEvent) => void
): Promise<void> {
  const maxResults = Math.min(params.maxResults || 15, 30);
  const queries = buildSearchQueries(params);
  const sourceLabel = getSourceLabel();

  onProgress({
    type: "progress",
    stage: "queries",
    message: `Building ${queries.length} search queries for ${params.city}...`,
  });

  // Collect all search result URLs
  const allUrls: string[] = [];
  let queriesDone = 0;

  for (const query of queries) {
    onProgress({
      type: "progress",
      stage: "search",
      message: `Searching ${sourceLabel}: "${query}"`,
      query,
      progress: queriesDone / queries.length,
    });

    const results = await searchWeb(query);
    for (const r of results) {
      if (!allUrls.includes(r.url)) allUrls.push(r.url);
    }

    queriesDone++;
  }

  if (allUrls.length === 0) {
    onProgress({
      type: "progress",
      stage: "search",
      message: "No URLs found from web search. Check your API configuration.",
      pagesFound: 0,
    });
    onProgress({ type: "complete", contactsFound: 0, pagesAnalyzed: 0 });
    return;
  }

  const urlsToScrape = allUrls.slice(0, Math.min(allUrls.length, 25));

  onProgress({
    type: "progress",
    stage: "scraping",
    message: `Found ${urlsToScrape.length} pages to analyze...`,
    pagesFound: urlsToScrape.length,
  });

  // Scrape pages
  const pageDataList = await scrapePages(urlsToScrape, (scraped, total) => {
    onProgress({
      type: "progress",
      stage: "scraping",
      message: `Analyzing pages: ${scraped}/${total}...`,
      scraped,
      total,
    });
  });

  onProgress({
    type: "progress",
    stage: "extracting",
    message: `Extracting contact info from ${pageDataList.length} pages...`,
  });

  // Extract contacts
  const classified = [];
  for (const pageData of pageDataList) {
    const contact = extractContactInfo(pageData);
    if (!contact.isRelevant) continue;

    const prospect = classifyProspect(contact, {
      city: params.city,
      country: params.country,
      targetType: params.targetType,
    });

    classified.push(prospect);
  }

  // Deduplicate
  const unique = deduplicateProspects(classified).slice(0, maxResults);

  onProgress({
    type: "progress",
    stage: "saving",
    message: `Saving ${unique.length} contacts to database...`,
    contactsFound: unique.length,
  });

  // Save to DB (skip duplicates based on sourceUrl)
  let saved = 0;
  for (const prospect of unique) {
    try {
      const existing = await prisma.prospect.findFirst({
        where: { sourceUrl: prospect.sourceUrl },
      });

      if (existing) continue;

      await prisma.prospect.create({
        data: {
          name: prospect.name,
          city: prospect.city,
          country: prospect.country,
          targetType: prospect.targetType,
          description: prospect.description,
          source: prospect.source,
          sourceUrl: prospect.sourceUrl,
          website: prospect.website,
          email: prospect.email,
          phone: prospect.phone,
          instagram: prospect.instagram,
          facebook: prospect.facebook,
          linkedin: prospect.linkedin,
          priority: prospect.priority,
          confidence: prospect.confidence,
          status: "new",
        },
      });

      saved++;
    } catch {
      // Skip DB errors for individual prospects
    }
  }

  // Save search run
  await prisma.searchRun.create({
    data: {
      query: queries.join("; "),
      city: params.city,
      country: params.country,
      targetType: params.targetType,
      sourcesUsed: sourceLabel,
      resultsFound: pageDataList.length,
      contactsSaved: saved,
    },
  });

  onProgress({
    type: "complete",
    contactsFound: saved,
    pagesAnalyzed: pageDataList.length,
  });
}
