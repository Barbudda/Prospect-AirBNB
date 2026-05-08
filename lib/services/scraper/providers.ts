import type { SearchResult } from "./types";

export interface SearchProvider {
  id: string;
  name: string;
  isConfigured: boolean;
  search(query: string, language?: string): Promise<SearchResult[]>;
}

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

class DuckDuckGoProvider implements SearchProvider {
  id = "duckduckgo";
  name = "DuckDuckGo";
  isConfigured = true;

  async search(query: string, language = "fr"): Promise<SearchResult[]> {
    const { load } = await import("cheerio");
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    try {
      const response = await fetch("https://html.duckduckgo.com/html/", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": USER_AGENT,
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": `${language}-${language.toUpperCase()},${language};q=0.9,en;q=0.8`,
        },
        body: `q=${encodeURIComponent(query)}&kl=${language}-${language.toUpperCase()}&ia=web`,
        signal: controller.signal,
      });

      clearTimeout(timeout);
      if (!response.ok) return [];

      const html = await response.text();
      const $ = load(html);
      const results: SearchResult[] = [];

      $(".result").each((_i, el) => {
        const $el = $(el);
        const anchor = $el.find(".result__a");
        const snippet = $el.find(".result__snippet").text().trim();
        const title = anchor.text().trim();
        const href = anchor.attr("href") || "";
        const url = this.resolveUrl(href);
        if (title && url && url.startsWith("http")) {
          results.push({ title, snippet, url });
        }
      });

      return results.slice(0, 10);
    } catch {
      clearTimeout(timeout);
      return [];
    }
  }

  private resolveUrl(href: string): string {
    if (!href) return "";
    if (href.includes("uddg=")) {
      const match = href.match(/uddg=([^&]+)/);
      if (match) {
        try { return decodeURIComponent(match[1]); } catch { return ""; }
      }
    }
    if (href.startsWith("//")) return "https:" + href;
    if (href.startsWith("http")) return href;
    return "";
  }
}

class SerpApiProvider implements SearchProvider {
  id = "serpapi";
  name = "SerpAPI";
  isConfigured: boolean;
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.SERPAPI_API_KEY || "";
    this.isConfigured = !!this.apiKey;
  }

  async search(query: string, language = "fr"): Promise<SearchResult[]> {
    if (!this.isConfigured) return [];

    const url = new URL("https://serpapi.com/search.json");
    url.searchParams.set("q", query);
    url.searchParams.set("api_key", this.apiKey);
    url.searchParams.set("hl", language);
    url.searchParams.set("gl", language === "fr" ? "fr" : "us");
    url.searchParams.set("num", "10");

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch(url.toString(), { signal: controller.signal });
      clearTimeout(timeout);
      if (!response.ok) return [];

      const data = (await response.json()) as {
        organic_results?: Array<{ title?: string; snippet?: string; link?: string }>;
      };

      return (data.organic_results || [])
        .map((r) => ({ title: r.title || "", snippet: r.snippet || "", url: r.link || "" }))
        .filter((r) => r.url.startsWith("http"));
    } catch {
      clearTimeout(timeout);
      return [];
    }
  }
}

class BraveSearchProvider implements SearchProvider {
  id = "brave";
  name = "Brave Search";
  isConfigured: boolean;
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.BRAVE_SEARCH_API_KEY || "";
    this.isConfigured = !!this.apiKey;
  }

  async search(query: string, language = "fr"): Promise<SearchResult[]> {
    if (!this.isConfigured) return [];

    const url = new URL("https://api.search.brave.com/res/v1/web/search");
    url.searchParams.set("q", query);
    url.searchParams.set("count", "10");
    url.searchParams.set("search_lang", language);
    url.searchParams.set("country", language === "fr" ? "FR" : "US");

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch(url.toString(), {
        headers: {
          Accept: "application/json",
          "Accept-Encoding": "gzip",
          "X-Subscription-Token": this.apiKey,
        },
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (!response.ok) return [];

      const data = (await response.json()) as {
        web?: { results?: Array<{ title?: string; description?: string; url?: string }> };
      };

      return (data.web?.results || [])
        .map((r) => ({ title: r.title || "", snippet: r.description || "", url: r.url || "" }))
        .filter((r) => r.url.startsWith("http"));
    } catch {
      clearTimeout(timeout);
      return [];
    }
  }
}

export function getBestProvider(): SearchProvider {
  const serp = new SerpApiProvider();
  if (serp.isConfigured) return serp;

  const brave = new BraveSearchProvider();
  if (brave.isConfigured) return brave;

  return new DuckDuckGoProvider();
}

export function getProviderStatuses() {
  const serp = new SerpApiProvider();
  const brave = new BraveSearchProvider();

  return [
    {
      id: "duckduckgo",
      name: "DuckDuckGo",
      description: "Free web search. No API key required. May rate-limit on heavy use.",
      configured: true,
      active: !serp.isConfigured && !brave.isConfigured,
    },
    {
      id: "serpapi",
      name: "SerpAPI (Google)",
      description: "Reliable Google results. Add SERPAPI_API_KEY to .env.",
      configured: serp.isConfigured,
      active: serp.isConfigured,
    },
    {
      id: "brave",
      name: "Brave Search",
      description: "Independent index. Add BRAVE_SEARCH_API_KEY to .env.",
      configured: brave.isConfigured,
      active: brave.isConfigured && !serp.isConfigured,
    },
    {
      id: "google_places",
      name: "Google Places",
      description: "Local businesses with address, phone, rating. Add GOOGLE_MAPS_API_KEY to .env.",
      configured: !!process.env.GOOGLE_MAPS_API_KEY,
      active: !!process.env.GOOGLE_MAPS_API_KEY,
    },
  ];
}
