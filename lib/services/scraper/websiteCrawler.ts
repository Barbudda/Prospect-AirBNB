import type { PageData } from "./types";

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

const SKIP_DOMAINS = [
  "airbnb.com", "airbnb.fr", "booking.com", "google.com", "google.fr",
  "facebook.com", "instagram.com", "twitter.com", "x.com", "tiktok.com",
  "youtube.com", "wikipedia.org", "tripadvisor.com", "tripadvisor.fr",
  "leboncoin.fr", "seloger.com", "pap.fr", "reddit.com", "duckduckgo.com",
  "bing.com", "amazon.com", "amazon.fr", "linkedin.com", "pinterest.com",
  "yelp.com", "pages.jaunes.fr", "pagesjaunes.fr",
];

const PRIORITY_PATHS = [
  "/contact", "/contact-us", "/nous-contacter", "/contactez-nous",
  "/about", "/about-us", "/qui-sommes-nous", "/a-propos",
  "/services", "/prestations", "/offres",
  "/pricing", "/tarifs",
  "/booking", "/reservation", "/reservations",
  "/team", "/equipe",
];

function shouldSkip(url: string): boolean {
  try {
    const { hostname, protocol } = new URL(url);
    if (!["http:", "https:"].includes(protocol)) return true;
    // Block private IP ranges (SSRF prevention)
    if (/^(127\.|10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|::1|localhost)/.test(hostname)) return true;
    const bare = hostname.replace("www.", "");
    return SKIP_DOMAINS.some((d) => bare === d || bare.endsWith("." + d));
  } catch {
    return true;
  }
}

async function fetchPage(url: string): Promise<PageData | null> {
  if (shouldSkip(url)) return null;

  const { load } = await import("cheerio");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

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
    if (html.length > 2_000_000) return null;

    const $ = load(html);
    $("script, style, noscript, iframe, svg").remove();

    const title = $("title").text().trim();
    const description =
      $('meta[name="description"]').attr("content")?.trim() ||
      $('meta[property="og:description"]').attr("content")?.trim() ||
      "";
    const text = $("body").text().replace(/\s+/g, " ").trim().slice(0, 10000);
    const finalUrl = response.url || url;

    return { url, finalUrl, title, description, text, html, statusCode: response.status, fetchedAt: new Date() };
  } catch {
    clearTimeout(timeout);
    return null;
  }
}

async function discoverSubPages(baseUrl: string, html: string, max: number): Promise<string[]> {
  const { load } = await import("cheerio");
  const $ = load(html);
  const base = new URL(baseUrl);
  const found = new Set<string>();

  // Try priority paths first
  for (const path of PRIORITY_PATHS) {
    if (found.size >= max) break;
    found.add(`${base.protocol}//${base.hostname}${path}`);
  }

  // Also check actual links in the page
  $("a[href]").each((_i, el) => {
    if (found.size >= max * 2) return false;
    const href = $(el).attr("href") || "";
    try {
      const resolved = new URL(href, baseUrl);
      if (resolved.hostname !== base.hostname) return;
      const path = resolved.pathname.toLowerCase();
      if (PRIORITY_PATHS.some((p) => path.includes(p.slice(1)))) {
        found.add(resolved.href.split("?")[0]);
      }
    } catch { /* invalid */ }
    return undefined;
  });

  return Array.from(found).slice(0, max);
}

export async function crawlWebsite(url: string, maxPages = 3): Promise<PageData[]> {
  const pages: PageData[] = [];

  let homeUrl = url;
  try {
    const parsed = new URL(url);
    homeUrl = `${parsed.protocol}//${parsed.hostname}`;
  } catch {
    return [];
  }

  const homepage = await fetchPage(homeUrl);
  if (!homepage) return [];
  pages.push(homepage);

  if (maxPages <= 1) return pages;

  const subUrls = await discoverSubPages(homeUrl, homepage.html, maxPages);

  for (const subUrl of subUrls) {
    if (pages.length >= maxPages) break;
    if (pages.some((p) => p.finalUrl === subUrl || p.url === subUrl)) continue;
    await new Promise((r) => setTimeout(r, 800)); // 1 req/sec per domain
    const page = await fetchPage(subUrl);
    if (page) pages.push(page);
  }

  return pages;
}

export async function crawlWebsites(
  urls: string[],
  maxPagesPerSite: number,
  onProgress: (done: number, total: number, url: string) => void
): Promise<{ url: string; pages: PageData[] }[]> {
  const results: { url: string; pages: PageData[] }[] = [];
  const concurrency = 2;

  for (let i = 0; i < urls.length; i += concurrency) {
    const batch = urls.slice(i, i + concurrency);
    const batchResults = await Promise.all(
      batch.map(async (url, bi) => {
        const pages = await crawlWebsite(url, maxPagesPerSite);
        onProgress(i + bi + 1, urls.length, url);
        return { url, pages };
      })
    );
    results.push(...batchResults);
  }

  return results;
}
