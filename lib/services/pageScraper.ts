const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

export type PageData = {
  url: string;
  title: string;
  description: string;
  text: string;
  html: string;
};

// Domains we skip — platforms that block scraping or are irrelevant
const SKIP_DOMAINS = [
  "airbnb.com",
  "airbnb.fr",
  "booking.com",
  "google.com",
  "google.fr",
  "facebook.com",
  "instagram.com",
  "twitter.com",
  "tiktok.com",
  "youtube.com",
  "wikipedia.org",
  "tripadvisor.com",
  "tripadvisor.fr",
  "leboncoin.fr",
  "seloger.com",
  "pap.fr",
  "reddit.com",
  "duckduckgo.com",
  "bing.com",
];

function shouldSkip(url: string): boolean {
  try {
    const hostname = new URL(url).hostname.replace("www.", "");
    return SKIP_DOMAINS.some((d) => hostname === d || hostname.endsWith("." + d));
  } catch {
    return true;
  }
}

export async function scrapePage(url: string): Promise<PageData | null> {
  if (shouldSkip(url)) return null;

  const { load } = await import("cheerio");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
      },
      redirect: "follow",
    });

    clearTimeout(timeout);
    if (!response.ok) return null;

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) return null;

    const html = await response.text();
    const $ = load(html);

    $("script, style, noscript, iframe, nav, footer, header").remove();

    const title = $("title").text().trim();
    const description =
      $('meta[name="description"]').attr("content")?.trim() ||
      $('meta[property="og:description"]').attr("content")?.trim() ||
      "";

    const text = $("body").text().replace(/\s+/g, " ").trim().slice(0, 8000);

    return { url, title, description, text, html };
  } catch {
    clearTimeout(timeout);
    return null;
  }
}

// Scrape multiple pages in parallel, max 3 concurrent
export async function scrapePages(
  urls: string[],
  onProgress?: (scraped: number, total: number) => void
): Promise<PageData[]> {
  const results: PageData[] = [];
  const concurrency = 3;

  for (let i = 0; i < urls.length; i += concurrency) {
    const batch = urls.slice(i, i + concurrency);
    const batchResults = await Promise.all(batch.map(scrapePage));
    for (const r of batchResults) {
      if (r) results.push(r);
    }
    if (onProgress) onProgress(Math.min(i + concurrency, urls.length), urls.length);
  }

  return results;
}
