export type ScraperInput = {
  targetDescription: string;
  location: string;
  country: string;
  industry?: string;
  keywords?: string;
  negativeKeywords?: string;
  maxResults?: number;
  maxPagesPerSite?: number;
  language?: string;
};

export type SearchResult = {
  title: string;
  snippet: string;
  url: string;
};

export type PageData = {
  url: string;
  finalUrl: string;
  title: string;
  description: string;
  text: string;
  html: string;
  statusCode: number;
  fetchedAt: Date;
};

export type Signal = {
  type: string;
  label: string;
  confidence: "high" | "medium" | "low";
  evidence?: string;
};

export type ExtractedLead = {
  name: string | null;
  description: string | null;
  address: string | null;
  email: string | null;
  phone: string | null;
  website: string;
  sourceUrl: string;
  instagram: string | null;
  facebook: string | null;
  linkedin: string | null;
  tiktok: string | null;
  twitter: string | null;
  signals: Signal[];
  technologyStack: string[];
  isRelevant: boolean;
  relevanceScore: number;
};

export type ScoredLead = ExtractedLead & {
  priority: "high" | "medium" | "low";
  confidence: "high" | "medium" | "low";
  reasons: string[];
  angle: string | null;
  nextAction: string;
};

export type ScraperStats = {
  queriesRun: number;
  urlsFound: number;
  pagesAnalyzed: number;
  leadsFound: number;
  leadsSaved: number;
  duplicatesSkipped: number;
  errors: number;
};

export type ProgressEvent =
  | { type: "log"; level: "info" | "warning" | "error" | "success"; message: string; metadata?: Record<string, unknown> }
  | { type: "progress"; stage: string; message: string; stats?: ScraperStats }
  | { type: "complete"; stats: ScraperStats; scrapeRunId?: string }
  | { type: "error"; message: string };
