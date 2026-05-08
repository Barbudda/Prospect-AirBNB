"use client";

import { useState, useRef } from "react";
import { AppShell } from "@/components/app-shell";
import {
  Search,
  Loader2,
  MapPin,
  Target,
  Globe,
  Mail,
  Phone,
  Instagram,
  Facebook,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

type ProgressEvent = {
  type: "progress" | "complete" | "error";
  stage?: string;
  message?: string;
  contactsFound?: number;
  pagesAnalyzed?: number;
};

type DbProspect = {
  id: string;
  name: string;
  city: string;
  targetType: string;
  email: string | null;
  phone: string | null;
  website: string | null;
  instagram: string | null;
  facebook: string | null;
  priority: string;
  confidence: string;
  sourceUrl: string;
};

const TARGET_TYPES = [
  { value: "all", label: "All types" },
  { value: "concierge", label: "Concierge / Property manager" },
  { value: "host", label: "Airbnb host / Owner" },
  { value: "property_manager", label: "Property manager" },
];

const COUNTRIES = [
  "France",
  "Belgium",
  "Switzerland",
  "Spain",
  "Italy",
  "Portugal",
  "United Kingdom",
];

function PriorityDot({ priority }: { priority: string }) {
  return (
    <span
      className={`inline-block h-2 w-2 rounded-full ${
        priority === "high"
          ? "bg-emerald-500"
          : priority === "medium"
          ? "bg-amber-400"
          : "bg-slate-300 dark:bg-slate-600"
      }`}
    />
  );
}

function ContactBadges({ prospect }: { prospect: DbProspect }) {
  const badges = [];
  if (prospect.email) badges.push({ icon: Mail, label: "Email", color: "text-blue-500" });
  if (prospect.phone) badges.push({ icon: Phone, label: "Phone", color: "text-emerald-500" });
  if (prospect.website) badges.push({ icon: Globe, label: "Website", color: "text-slate-400" });
  if (prospect.instagram) badges.push({ icon: Instagram, label: "Instagram", color: "text-pink-500" });
  if (prospect.facebook) badges.push({ icon: Facebook, label: "Facebook", color: "text-blue-400" });

  if (badges.length === 0)
    return <span className="text-xs text-slate-400 dark:text-slate-500">No contact found</span>;

  return (
    <div className="flex items-center gap-2">
      {badges.map((b) => (
        <span key={b.label} title={b.label}><b.icon className={`h-3.5 w-3.5 ${b.color}`} /></span>
      ))}
    </div>
  );
}

export default function SearchPage() {
  const [loading, setLoading] = useState(false);
  const [progressLog, setProgressLog] = useState<string[]>([]);
  const [results, setResults] = useState<DbProspect[] | null>(null);
  const [stats, setStats] = useState<{ contactsFound: number; pagesAnalyzed: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const [form, setForm] = useState({
    city: "",
    country: "France",
    targetType: "all",
    keywords: "",
    maxResults: 15,
  });

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.city.trim()) return;

    setLoading(true);
    setResults(null);
    setProgressLog([]);
    setStats(null);
    setError(null);

    abortRef.current = new AbortController();

    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
        signal: abortRef.current.signal,
      });

      if (!response.ok || !response.body) {
        throw new Error("Search request failed");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const event: ProgressEvent = JSON.parse(line.slice(6));

            if (event.type === "progress" && event.message) {
              setProgressLog((prev) => [...prev.slice(-4), event.message!]);
            }

            if (event.type === "complete") {
              setStats({
                contactsFound: event.contactsFound || 0,
                pagesAnalyzed: event.pagesAnalyzed || 0,
              });
              // Fetch the newly saved prospects
              const res = await fetch(
                `/api/prospects?city=${encodeURIComponent(form.city)}`
              );
              const data = await res.json();
              setResults(data.prospects || []);
            }

            if (event.type === "error") {
              setError(event.message || "Search failed");
            }
          } catch {
            // Skip malformed events
          }
        }
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setError("Connection failed. Make sure the app is running properly.");
      }
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  };

  const handleStop = () => {
    abortRef.current?.abort();
    setLoading(false);
  };

  return (
    <AppShell
      title="Find Real Contacts"
      subtitle="Search public sources for real Airbnb hosts, concierges, and property managers."
    >
      <div className="flex flex-col gap-8">
        {/* Search Form */}
        <form
          onSubmit={handleSearch}
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#111]"
        >
          <div className="p-6 sm:p-8">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {/* City */}
              <div className="space-y-2 sm:col-span-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  City *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="e.g. Biarritz, Annecy, Lyon..."
                    required
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm font-medium outline-none transition focus:border-slate-400 focus:bg-white dark:border-white/10 dark:bg-white/5 dark:focus:border-white/30 dark:focus:bg-white/[0.08]"
                  />
                </div>
              </div>

              {/* Country */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Country
                </label>
                <select
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-3 text-sm font-medium outline-none transition focus:border-slate-400 focus:bg-white dark:border-white/10 dark:bg-white/5 dark:focus:border-white/30"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Target Type */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Target Type
                </label>
                <div className="relative">
                  <Target className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <select
                    value={form.targetType}
                    onChange={(e) => setForm({ ...form, targetType: e.target.value })}
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm font-medium outline-none transition focus:border-slate-400 focus:bg-white dark:border-white/10 dark:bg-white/5 dark:focus:border-white/30"
                  >
                    {TARGET_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Keywords */}
              <div className="space-y-2 sm:col-span-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Optional Keywords
                </label>
                <input
                  type="text"
                  placeholder="e.g. villa, superhost, agency..."
                  value={form.keywords}
                  onChange={(e) => setForm({ ...form, keywords: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm font-medium outline-none transition focus:border-slate-400 focus:bg-white dark:border-white/10 dark:bg-white/5 dark:focus:border-white/30 dark:focus:bg-white/[0.08]"
                />
              </div>

              {/* Max Results */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Max Results
                </label>
                <select
                  value={form.maxResults}
                  onChange={(e) =>
                    setForm({ ...form, maxResults: Number(e.target.value) })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-3 text-sm font-medium outline-none transition focus:border-slate-400 focus:bg-white dark:border-white/10 dark:bg-white/5 dark:focus:border-white/30"
                >
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                  <option value={20}>20</option>
                  <option value={30}>30</option>
                </select>
              </div>
            </div>
          </div>

          {/* Footer Bar */}
          <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-4 dark:border-white/5 dark:bg-white/[0.02]">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Searches public websites, business directories, and web results. No fake data.
            </p>
            <div className="flex items-center gap-3">
              {loading && (
                <button
                  type="button"
                  onClick={handleStop}
                  className="rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:border-red-900/30 dark:bg-transparent dark:text-red-400"
                >
                  Stop
                </button>
              )}
              <button
                type="submit"
                disabled={!form.city.trim() || loading}
                className="flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-50 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                Find real contacts
              </button>
            </div>
          </div>
        </form>

        {/* Loading / Progress */}
        {loading && (
          <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm dark:border-white/10 dark:bg-[#111]">
            <div className="flex items-center gap-4 mb-5">
              <div className="relative h-10 w-10 flex-shrink-0">
                <div className="absolute inset-0 rounded-full border-2 border-slate-100 dark:border-white/10" />
                <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-slate-800 animate-spin dark:border-t-white" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900 dark:text-white">
                  Searching public sources...
                </div>
                <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  This can take 30–60 seconds. Only real contacts will be saved.
                </div>
              </div>
            </div>
            <div className="space-y-1">
              {progressLog.map((msg, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-2 text-xs ${
                    i === progressLog.length - 1
                      ? "text-slate-700 dark:text-slate-300"
                      : "text-slate-400 dark:text-slate-500"
                  }`}
                >
                  <span className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-current opacity-60" />
                  {msg}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 dark:border-red-900/30 dark:bg-red-950/20">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-500 mt-0.5" />
            <div>
              <div className="text-sm font-semibold text-red-700 dark:text-red-400">
                Search error
              </div>
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          </div>
        )}

        {/* Results */}
        {!loading && results !== null && (
          <div className="space-y-5">
            {/* Summary */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {stats && stats.contactsFound > 0 ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-amber-500" />
                  )}
                  <span className="text-base font-semibold text-slate-900 dark:text-white">
                    {results.length === 0
                      ? "No real contacts found for this search."
                      : `${results.length} real contact${results.length > 1 ? "s" : ""} found`}
                  </span>
                </div>
                {stats && (
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    ({stats.pagesAnalyzed} pages analyzed)
                  </span>
                )}
              </div>
              {results.length > 0 && (
                <Link
                  href="/contacts"
                  className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                >
                  View all contacts
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>

            {results.length === 0 && !loading && stats !== null && (
              <div className="rounded-2xl border border-dashed border-slate-200 p-12 text-center dark:border-white/10">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  No real contacts found for this search. Try a different city or broader keywords.
                </p>
                <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
                  Tip: Adding a SerpAPI key in .env improves search results significantly.
                </p>
              </div>
            )}

            {/* Contact Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((prospect) => (
                <Link
                  key={prospect.id}
                  href={`/contacts/${prospect.id}`}
                  className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-slate-300 hover:shadow-sm dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-white/20"
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <PriorityDot priority={prospect.priority} />
                      <span className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                        {prospect.name}
                      </span>
                    </div>
                    <span className="flex-shrink-0 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-600 dark:bg-white/10 dark:text-slate-300">
                      {prospect.targetType.replace("_", " ")}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                    {prospect.city}
                  </p>

                  <div className="mt-auto flex items-center justify-between">
                    <ContactBadges prospect={prospect} />
                    <ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:text-slate-500 dark:text-slate-600 dark:group-hover:text-slate-400" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Source info banner */}
        {!loading && results === null && (
          <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-6 dark:border-white/5 dark:bg-white/[0.02]">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
              What Prospect searches
            </h3>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                {
                  icon: Globe,
                  label: "Public websites",
                  desc: "Business sites, concierge companies, property managers",
                },
                {
                  icon: Search,
                  label: "Web search",
                  desc: "Google/DuckDuckGo results for Airbnb + city queries",
                },
                {
                  icon: ExternalLink,
                  label: "Social links",
                  desc: "Instagram and Facebook pages found in public results",
                },
              ].map((s) => (
                <div key={s.label} className="flex items-start gap-3">
                  <s.icon className="h-4 w-4 flex-shrink-0 text-slate-400 mt-0.5" />
                  <div>
                    <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {s.label}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {s.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
