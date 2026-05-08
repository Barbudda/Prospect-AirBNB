export type CampaignStatus = "draft" | "running" | "completed" | "failed";
export type CampaignVertical = "airbnb" | "hospitality" | "real_estate" | "restaurants" | "local_business" | "healthcare" | "custom";
export type ProspectType = "individual_host" | "concierge" | "agency" | "multi_owner" | "premium_host" | "unknown";
export type CrmStatus = "new" | "to_enrich" | "qualified" | "to_contact" | "contacted" | "replied" | "demo_scheduled" | "converted" | "lost";
export type IntegrationStatus = "not_connected" | "connected" | "error" | "pending";
export type SearchAggressiveness = "careful" | "standard" | "wide";
export type ScannerObjective = "find_airbnb_hosts" | "find_conciergeries" | "find_guest_problems" | "find_owner_problems" | "find_reddit_discussions" | "find_forums" | "find_reviews" | "enrich_existing_prospect" | "understand_geo_zone" | "understand_property_type" | "find_sales_angles";
export type ScannerSourceType = "search_engine" | "reddit" | "forum" | "concierge_site" | "owner_site" | "airbnb_blog" | "local_directory" | "local_press" | "public_listing" | "maps" | "tourism_office" | "website" | "airbnb_public_mock" | "local_scraper";
export type ScannerRunStatus = "pending" | "running" | "ai_analysis" | "enriching" | "completed" | "partial_success" | "error" | "cancelled";
export type ScannerDepth = "surface" | "standard" | "deep";
export type LegalStatus = "allowed_public" | "official_api_preferred" | "mock_only" | "requires_permission" | "blocked";

export type User = {
  id: string;
  email: string;
  name: string;
  company: string;
  createdAt: string;
};

export type Campaign = {
  id: string;
  userId: string;
  name: string;
  vertical: CampaignVertical;
  city: string;
  country: string;
  status: CampaignStatus;
  searchParams: SearchParams;
  totalResults: number;
  qualifiedProspects: number;
  averageScore: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type SearchParams = {
  city: string;
  country: string;
  radiusOrDistrict: string;
  targetType: string;
  desiredVolume: number;
  keywords: string;
  language: string;
  aggressiveness: SearchAggressiveness;
};

export type PainSignal = {
  id: string;
  prospectId: string;
  type: string;
  label: string;
  severity: "low" | "medium" | "high";
  evidence: string;
  source: string;
  createdAt: string;
};

export type Action = {
  id: string;
  prospectId: string;
  userId: string;
  type: string;
  note: string;
  dueDate: string | null;
  completed: boolean;
  createdAt: string;
};

export type Prospect = {
  id: string;
  campaignId: string;
  userId: string;
  name: string;
  type: ProspectType;
  city: string;
  country: string;
  sourceUrl: string;
  sourceName: string;
  relatedSources: string[];
  listingTitle: string;
  companyName: string;
  estimatedProperties: number;
  contactEmail: string | null;
  contactPhone: string | null;
  website: string | null;
  linkedinUrl: string | null;
  globalScore: number;
  conciergeNeedScore: number;
  buyingProbabilityScore: number;
  contactabilityScore: number;
  digitalMaturityScore: number;
  locationComplexityScore?: number;
  propertyComplexityScore?: number;
  guestQuestionPotentialScore?: number;
  automationNeedScore?: number;
  upsellPotentialScore?: number;
  operationalPainScore?: number;
  outreachPersonalizationScore?: number;
  status: CrmStatus;
  tags: string[];
  painSignals: PainSignal[];
  opportunities: string[];
  aiSummary: string;
  outreachAngle: string;
  generatedEmail: string;
  generatedLinkedinMessage: string;
  generatedCallScript: string;
  confidenceLevel: number;
  convertedToConciergeClient: boolean;
  conciergeOpportunityId: string | null;
  conciergeSetupNeeds: ConciergeSetupNeeds;
  inferredPropertyType?: string;
  inferredLocationContext?: string;
  inferredGuestProfile?: string;
  likelyOperationalProblems?: string[];
  likelyGuestQuestions?: string[];
  likelyOwnerPainPoints?: string[];
  likelyUpsellOpportunities?: string[];
  recommendedConciergeFeatures?: string[];
  recommendedOutreachAngle?: string;
  sourceEvidence?: string[];
  scannerConfidenceScore?: number;
  scannerRunId?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ConciergeSetupNeeds = {
  languages: string[];
  frequentQuestions: string[];
  propertyType: string;
  additionalServices: string[];
  painPoints: string[];
  documentsToRequest: string[];
  qrCodeWanted: boolean;
  propertiesCount: number;
};

export type Integration = {
  id: string;
  userId: string;
  provider: string;
  status: IntegrationStatus;
  apiKeyEncrypted: string | null;
  createdAt: string;
};

export type DashboardStats = {
  totalProspects: number;
  hotProspects: number;
  toContact: number;
  qualificationRate: number;
  citiesAnalyzed: number;
  estimatedOpportunities: string;
};

export type ScannerRun = {
  id: string;
  userId: string;
  campaignId?: string | null;
  prospectId?: string | null;
  name: string;
  objective: ScannerObjective;
  city: string;
  country: string;
  neighborhood?: string | null;
  targetType: string;
  sources: ScannerSourceType[];
  keywords: string;
  language: string;
  depth: ScannerDepth;
  volume: number;
  status: ScannerRunStatus;
  progress: number;
  logs: string[];
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ScannedSource = {
  id: string;
  scannerRunId: string;
  sourceType: ScannerSourceType;
  sourceName: string;
  title: string;
  url: string;
  snippet: string;
  extractedText: string;
  authorName?: string | null;
  publishedAt?: string | null;
  relevanceScore: number;
  credibilityScore: number;
  legalStatus: LegalStatus;
  createdAt: string;
};

export type ScannerInsight = {
  id: string;
  scannerRunId: string;
  prospectId?: string | null;
  type: string;
  label: string;
  description: string;
  severity: "low" | "medium" | "high";
  frequency: number;
  city: string;
  country: string;
  propertyType: string;
  guestProfile: string;
  ownerPainPoint: string;
  guestPainPoint: string;
  businessOpportunity: string;
  recommendedConciergeFeature: string;
  outreachAngle: string;
  evidence: string;
  sourceIds: string[];
  confidenceScore: number;
  createdAt: string;
};

export type PropertyContext = {
  id: string;
  prospectId: string;
  propertyType: string;
  locationType: string;
  estimatedCapacity: number;
  premiumLevel: "low" | "medium" | "high";
  accessComplexity: number;
  weatherSensitivity: number;
  seasonality: string;
  guestProfile: string;
  operationalRisks: string[];
  likelyQuestions: string[];
  recommendedConciergeFeatures: string[];
  confidenceScore: number;
  createdAt: string;
  updatedAt: string;
};

export type LocationContext = {
  id: string;
  city: string;
  country: string;
  neighborhood?: string | null;
  climateType: string;
  tourismType: string;
  seasonality: string;
  transportContext: string;
  parkingDifficulty: "low" | "medium" | "high";
  weatherRisks: string[];
  localActivities: string[];
  commonGuestQuestions: string[];
  upsellOpportunities: string[];
  operationalConstraints: string[];
  createdAt: string;
  updatedAt: string;
};

export type ScannerSearchParams = {
  city: string;
  country: string;
  neighborhood?: string;
  targetType: string;
  keywords: string;
  sources: ScannerSourceType[];
  language: string;
  depth: ScannerDepth;
  volume: number;
  objective: ScannerObjective;
  campaignId?: string;
  prospectId?: string;
};

export type ScannerReport = {
  scannerRunId: string;
  executiveSummary: string;
  dominantPainPoints: string[];
  topCommercialAngles: string[];
  recommendedConciergeSetup: {
    languages: string[];
    frequentQuestions: string[];
    documentsToRequest: string[];
    features: string[];
    automationLevel: "light" | "standard" | "advanced";
    qrCodeRecommended: boolean;
  };
  v3Placeholders: string[];
};

// V1 SIMPLIFIED PROSPECT TYPES
export type ProspectTargetType = "host" | "concierge" | "owner" | "unknown";
export type ProspectPriority = "high" | "medium" | "low";
export type ProspectNewStatus = "to_enrich" | "to_contact" | "contacted" | "replied" | "interview_scheduled" | "interested" | "willing_to_pay" | "not_interested";
export type ProspectInterestLevel = "low" | "medium" | "high" | "unknown";
export type ProspectWillingToPay = "yes" | "no" | "maybe" | "unknown";

export type ProspectContact = {
  id: string;
  name: string;
  city: string;
  country: string;
  targetType: ProspectTargetType;
  propertyType: string;
  source: string;
  sourceUrl: string;
  contactMethod: string;
  email: string | null;
  phone: string | null;
  instagram: string | null;
  website: string | null;
  priority: ProspectPriority;
  status: ProspectNewStatus;
  interestLevel: ProspectInterestLevel;
  willingToPay: ProspectWillingToPay;
  reasonsToContact: string[];
  suggestedMessage: string;
  notes: string;
  nextFollowUpDate: string | null;
  createdAt: string;
  updatedAt: string;
};

