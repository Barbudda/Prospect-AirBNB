const TECH_PATTERNS: Array<{ name: string; patterns: RegExp[] }> = [
  { name: "WordPress", patterns: [/wp-content\//i, /wp-includes\//i] },
  { name: "WooCommerce", patterns: [/woocommerce/i] },
  { name: "Shopify", patterns: [/cdn\.shopify\.com/i, /shopify\.com\/s\//i] },
  { name: "Webflow", patterns: [/webflow\.com/i, /\.webflow\.io/i] },
  { name: "Wix", patterns: [/wixstatic\.com/i, /wix\.com\/wix-vod/i] },
  { name: "Squarespace", patterns: [/squarespace\.com/i, /sqsp\.net/i] },
  { name: "Framer", patterns: [/framer\.com/i, /framerusercontent\.com/i] },
  { name: "Calendly", patterns: [/calendly\.com/i] },
  { name: "Typeform", patterns: [/typeform\.com/i] },
  { name: "Tally", patterns: [/tally\.so/i] },
  { name: "Crisp", patterns: [/crisp\.chat/i] },
  { name: "Intercom", patterns: [/intercom\.com/i, /intercomcdn\.com/i] },
  { name: "HubSpot", patterns: [/hubspot\.com/i, /hs-scripts\.com/i] },
  { name: "Google Analytics", patterns: [/google-analytics\.com/i, /gtag\(/i] },
  { name: "Meta Pixel", patterns: [/connect\.facebook\.net/i, /fbevents\.js/i] },
  { name: "Doctolib", patterns: [/doctolib\.fr/i] },
  { name: "OpenTable", patterns: [/opentable\.com/i, /opentable\.fr/i] },
  { name: "TheFork", patterns: [/lafourchette\.com/i, /thefork\.com/i] },
  { name: "Booking Widget", patterns: [/widget\.booking\.com/i] },
  { name: "Stripe", patterns: [/js\.stripe\.com/i] },
  { name: "PayPal", patterns: [/paypal\.com\/sdk/i] },
];

export function detectTechnologies(html: string): string[] {
  return TECH_PATTERNS.filter((t) => t.patterns.some((p) => p.test(html))).map((t) => t.name);
}
