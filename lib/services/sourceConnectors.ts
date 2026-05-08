import type { ScannedSource, ScannerSearchParams, ScannerSourceType } from "@/lib/types";
import { mockScannedSources } from "@/lib/scanner-mock-data";
import { getLocalScraperStatus, normalizeLocalScraperResult, scrapePublicUrlWithLocalScraper } from "@/lib/services/localScraperAdapter";

export type SourceConnector = {
  name: string;
  type: ScannerSourceType;
  enabled: boolean;
  rateLimitConfig: {
    requestsPerMinute: number;
    concurrency: number;
  };
  legalNotes: string;
  search: (params: ScannerSearchParams) => Promise<ScannedSource[]>;
  normalize: (rawResult: ScannedSource) => ScannedSource;
};

function filterSources(params: ScannerSearchParams, sourceType: ScannerSourceType) {
  const city = params.city.toLowerCase();
  return mockScannedSources
    .filter((source) => source.sourceType === sourceType || sourceType === "website")
    .filter((source) => `${source.title} ${source.snippet} ${source.extractedText}`.toLowerCase().includes(city) || params.depth === "deep")
    .slice(0, Math.max(1, Math.ceil(params.volume / 8)));
}

function createMockConnector(type: ScannerSourceType, name: string, legalNotes: string, requestsPerMinute = 30): SourceConnector {
  return {
    name,
    type,
    enabled: true,
    rateLimitConfig: { requestsPerMinute, concurrency: 1 },
    legalNotes,
    async search(params) {
      return filterSources(params, type).map((source) => this.normalize(source));
    },
    normalize(rawResult) {
      return { ...rawResult, sourceType: type === "website" ? rawResult.sourceType : type };
    },
  };
}

export const searchEngineConnector = createMockConnector("search_engine", "Internal Search Engine Connector", "V1 mock. En production: Google Custom Search, Bing ou SerpAPI via API officielle et quotas.", 20);
export const redditConnector = createMockConnector("reddit", "Reddit Connector", "Utiliser l'API officielle Reddit si activée. Pas de scraping agressif ni contournement.", 15);
export const forumConnector = createMockConnector("forum", "Forum Connector", "Forums publics uniquement, respect robots.txt et conditions d'utilisation.", 12);
export const websiteConnector = createMockConnector("website", "Website Connector", "Pages publiques autorisées, extraction douce et traçable.", 10);
export const mapsConnector = createMockConnector("maps", "Maps Connector", "Google Maps API officielle si disponible; mock en V1.", 10);
export const publicDirectoryConnector = createMockConnector("local_directory", "Public Directory Connector", "Annuaires publics ou autorisés uniquement.", 15);
export const airbnbPublicConnectorMock = createMockConnector("airbnb_public_mock", "Airbnb Public Connector Mock", "Mock uniquement en V1; ne pas scraper Airbnb sans autorisation ou API conforme.", 5);

export const localScraperConnector: SourceConnector = {
  name: "Local Scraper Adapter",
  type: "local_scraper" as ScannerSourceType,
  enabled: getLocalScraperStatus().enabled,
  rateLimitConfig: { requestsPerMinute: 5, concurrency: 1 },
  legalNotes: "Utiliser uniquement via l'adaptateur local interne. Pages publiques uniquement, respect robots.txt et conditions d'utilisation.",
  async search(params) {
    if (!getLocalScraperStatus().enabled) return [];
    const keywords = params.keywords || "";
    const urls = keywords.split(/[\s,]+/).filter((u) => u.startsWith("http")).slice(0, 3);
    if (!urls.length) return [];
    const results = await Promise.all(urls.map((url) => scrapePublicUrlWithLocalScraper(url)));
    return results.filter((r) => r.status === "success").map((r) => normalizeLocalScraperResult(r));
  },
  normalize(rawResult) {
    return rawResult;
  },
};

export const sourceConnectors = [
  searchEngineConnector,
  redditConnector,
  forumConnector,
  websiteConnector,
  mapsConnector,
  publicDirectoryConnector,
  airbnbPublicConnectorMock,
  localScraperConnector,
];

export function getEnabledConnectors(sourceTypes: ScannerSourceType[]) {
  return sourceConnectors.filter((connector) => connector.enabled && sourceTypes.includes(connector.type));
}
