export type SearchResult = {
  title: string;
  snippet: string;
  url: string;
};

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

function extractDdgUrl(href: string): string {
  if (!href) return "";
  // DDG redirect: //duckduckgo.com/l/?uddg=https%3A%2F%2F...
  if (href.includes("uddg=")) {
    const match = href.match(/uddg=([^&]+)/);
    if (match) {
      try {
        return decodeURIComponent(match[1]);
      } catch {
        return "";
      }
    }
  }
  if (href.startsWith("//")) return "https:" + href;
  if (href.startsWith("http")) return href;
  return "";
}

// DuckDuckGo HTML search — no API key required, may be rate-limited
export async function searchDuckDuckGo(query: string): Promise<SearchResult[]> {
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
        "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
      },
      body: `q=${encodeURIComponent(query)}&kl=fr-fr&ia=web`,
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
      const url = extractDdgUrl(href);

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

// SerpAPI — requires SERPAPI_API_KEY
export async function searchSerpApi(
  query: string,
  apiKey: string
): Promise<SearchResult[]> {
  const url = new URL("https://serpapi.com/search.json");
  url.searchParams.set("q", query);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("hl", "fr");
  url.searchParams.set("gl", "fr");
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
      .map((r) => ({
        title: r.title || "",
        snippet: r.snippet || "",
        url: r.link || "",
      }))
      .filter((r) => r.url.startsWith("http"));
  } catch {
    clearTimeout(timeout);
    return [];
  }
}

// Choose the best available search provider
export async function searchWeb(query: string): Promise<SearchResult[]> {
  const serpKey = process.env.SERPAPI_API_KEY;
  if (serpKey) {
    const results = await searchSerpApi(query, serpKey);
    if (results.length > 0) return results;
  }
  return searchDuckDuckGo(query);
}
