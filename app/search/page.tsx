"use client";

import { useState, useRef, useEffect } from "react";
import { AppShell } from "@/components/app-shell";
import {
  Search,
  Loader2,
  MapPin,
  Globe,
  Mail,
  Phone,
  Instagram,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Zap,
  TrendingUp,
  Activity,
} from "lucide-react";
import Link from "next/link";

// ─── Types ───────────────────────────────────────────────────────────────────

type LogEntry = {
  id: number;
  level: "info" | "success" | "warning" | "error";
  message: string;
};

type Stats = {
  queriesRun: number;
  urlsFound: number;
  pagesAnalyzed: number;
  leadsFound: number;
  leadsSaved: number;
  duplicatesSkipped: number;
  errors: number;
};

type Lead = {
  id: string;
  name: string;
  city: string;
  targetType: string;
  email: string | null;
  phone: string | null;
  website: string | null;
  instagram: string | null;
  priority: string;
  confidence: string;
  signals: string | null;
  angle: string | null;
  nextAction: string | null;
  sourceUrl: string;
};

type Stage =
  | "idle"
  | "planning"
  | "searching"
  | "crawling"
  | "extracting"
  | "deduplicating"
  | "saving"
  | "done";

const STAGES: Stage[] = [
  "planning",
  "searching",
  "crawling",
  "extracting",
  "deduplicating",
  "saving",
];

const STAGE_LABELS: Record<Stage, string> = {
  idle: "Idle",
  planning: "Planning",
  searching: "Searching",
  crawling: "Crawling",
  extracting: "Extracting",
  deduplicating: "Deduplicating",
  saving: "Saving",
  done: "Done",
};

const COUNTRIES = [
  "France",
  "Belgium",
  "Switzerland",
  "Spain",
  "Italy",
  "Portugal",
  "United Kingdom",
  "Germany",
  "Netherlands",
  "United States",
];

const INDUSTRIES = [
  { value: "", label: "Auto-detect" },
  { value: "airbnb", label: "Airbnb / Short-term rental" },
  { value: "concierge", label: "Concierge / Property management" },
  { value: "hotel", label: "Hotels & Hospitality" },
  { value: "restaurant", label: "Restaurants & Cafés" },
  { value: "real_estate", label: "Real Estate Agency" },
  { value: "fitness", label: "Fitness / Gym / Wellness" },
  { value: "dental", label: "Dental / Medical" },
];

// ─── Sub-components ──────────────────────────────────────────────────────────

function StageBar({ stage }: { stage: Stage }) {
  const activeIdx = STAGES.indexOf(stage);
  return (
    <div className="flex items-center gap-0">
      {STAGES.map((s, i) => {
        const done = activeIdx > i;
        const active = activeIdx === i;
        return (
          <div key={s} className="flex items-center gap-0 flex-1 min-w-0">
            <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
              <div
                className={`h-1.5 w-full rounded-full transition-all duration-500 ${
                  done
                    ? "bg-emerald-500"
                    : active
                    ? "bg-blue-500 animate-pulse"
                    : "bg-slate-200 dark:bg-white/10"
                }`}
              />
              <span
                className={`text-[10px] font-medium hidden sm:block ${
                  done
                    ? "text-emerald-600 dark:text-emerald-400"
                    : active
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-slate-400 dark:text-slate-500"
                }`}
              >
                {STAGE_LABELS[s]}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.04]">
      <div className="rounded-lg bg-slate-100 p-2 dark:bg-white/10">
        <Icon className="h-4 w-4 text-slate-600 dark:text-slate-300" />
      </div>
      <div>
        <div className="text-lg font-bold text-slate-900 dark:text-white">{value}</div>
        <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
      </div>
    </div>
  );
}

function LogLine({ entry }: { entry: LogEntry }) {
  const icon =
    entry.level === "success"
      ? "✓"
      : entry.level === "error"
      ? "✗"
      : entry.level === "warning"
      ? "!"
      : "·";
  const color =
    entry.level === "success"
      ? "text-emerald-500"
      : entry.level === "error"
      ? "text-red-400"
      : entry.level === "warning"
      ? "text-amber-400"
      : "text-slate-400 dark:text-slate-500";

  return (
    <div className="flex items-start gap-2 py-0.5">
      <span className={`mt-0.5 flex-shrink-0 text-xs font-bold ${color}`}>{icon}</span>
      <span className="text-xs text-slate-700 dark:text-slate-300 break-all">{entry.message}</span>
    </div>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const cfg =
    priority === "high"
      ? { label: "High", cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" }
      : priority === "medium"
      ? { label: "Med", cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" }
      : { label: "Low", cls: "bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-400" };
  return (
    <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

function ContactRow({ lead }: { lead: Lead }) {
  return (
    <div className="flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
      {lead.email && (
        <span className="flex items-center gap-1">
          <Mail className="h-3 w-3 text-blue-400" />
          {lead.email}
        </span>
      )}
      {lead.phone && (
        <span className="flex items-center gap-1">
          <Phone className="h-3 w-3 text-emerald-400" />
          {lead.phone}
        </span>
      )}
      {lead.instagram && (
        <span className="flex items-center gap-1">
          <Instagram className="h-3 w-3 text-pink-400" />
          {lead.instagram.replace("https://instagram.com/", "@").replace("https://www.instagram.com/", "@")}
        </span>
      )}
      {lead.website && !lead.email && !lead.phone && (
        <span className="flex items-center gap-1">
          <Globe className="h-3 w-3 text-slate-400" />
          {lead.website.replace(/^https?:\/\/(www\.)?/, "").slice(0, 30)}
        </span>
      )}
      {!lead.email && !lead.phone && !lead.instagram && !lead.website && (
        <span className="text-slate-300 dark:text-slate-600">No contact found</span>
      )}
    </div>
  );
}

function LeadCard({ lead }: { lead: Lead }) {
  let signals: string[] = [];
  try {
    const parsed = JSON.parse(lead.signals || "[]");
    signals = parsed.slice(0, 3).map((s: { label?: string; type?: string }) => s.label || s.type || String(s));
  } catch {
    signals = [];
  }

  return (
    <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/[0.03]">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <PriorityBadge priority={lead.priority} />
          <span className="truncate text-sm font-semibold text-slate-900 dark:text-white">
            {lead.name}
          </span>
        </div>
        <span className="flex-shrink-0 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-600 dark:bg-white/10 dark:text-slate-300">
          {lead.targetType.replace(/_/g, " ")}
        </span>
      </div>

      <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mb-3">
        <MapPin className="h-3 w-3" />
        {lead.city}
      </div>

      <ContactRow lead={lead} />

      {signals.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {signals.map((s, i) => (
            <span
              key={i}
              className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
            >
              {s}
            </span>
          ))}
        </div>
      )}

      {lead.angle && (
        <p className="mt-3 text-xs italic text-slate-500 dark:text-slate-400 line-clamp-2">
          {lead.angle}
        </p>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-white/5">
        {lead.nextAction && (
          <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
            → {lead.nextAction}
          </span>
        )}
        <a
          href={lead.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="ml-auto flex items-center gap-1 text-[10px] text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
        >
          Source <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SearchPage() {
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState<Stage>("idle");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [stats, setStats] = useState<Stats>({
    queriesRun: 0,
    urlsFound: 0,
    pagesAnalyzed: 0,
    leadsFound: 0,
    leadsSaved: 0,
    duplicatesSkipped: 0,
    errors: 0,
  });
  const [leads, setLeads] = useState<Lead[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scrapeRunId, setScrapeRunId] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const logIdRef = useRef(0);
  const didCompleteRef = useRef(false);

  const [form, setForm] = useState({
    targetDescription: "",
    location: "",
    country: "France",
    industry: "",
    keywords: "",
    negativeKeywords: "",
    maxResults: 20,
    maxPagesPerSite: 3,
  });

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs]);

  const addLog = (level: LogEntry["level"], message: string) => {
    setLogs((prev) => [...prev, { id: logIdRef.current++, level, message }]);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.targetDescription.trim() || !form.location.trim()) return;

    setLoading(true);
    setStage("planning");
    setLogs([]);
    setStats({ queriesRun: 0, urlsFound: 0, pagesAnalyzed: 0, leadsFound: 0, leadsSaved: 0, duplicatesSkipped: 0, errors: 0 });
    setLeads(null);
    setError(null);
    setScrapeRunId(null);
    logIdRef.current = 0;
    didCompleteRef.current = false;

    abortRef.current = new AbortController();

    try {
      const response = await fetch("/api/scraper/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetDescription: form.targetDescription,
          location: form.location,
          country: form.country,
          industry: form.industry || undefined,
          keywords: form.keywords || undefined,
          negativeKeywords: form.negativeKeywords || undefined,
          maxResults: form.maxResults,
          maxPagesPerSite: form.maxPagesPerSite,
        }),
        signal: abortRef.current.signal,
      });

      if (!response.ok || !response.body) {
        const errData = await response.json().catch(() => ({}));
        throw new Error((errData as { error?: string }).error || "Request failed");
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
            const event = JSON.parse(line.slice(6));

            if (event.type === "log") {
              addLog(event.level, event.message);
            }

            if (event.type === "progress") {
              if (event.stage) setStage(event.stage as Stage);
              if (event.stats) setStats(event.stats);
            }

            if (event.type === "complete") {
              didCompleteRef.current = true;
              setStage("done");
              if (event.stats) setStats(event.stats);
              if (event.scrapeRunId) {
                setScrapeRunId(event.scrapeRunId);
                const res = await fetch(`/api/scraper/runs/${event.scrapeRunId}`);
                if (res.ok) {
                  const data = await res.json();
                  setLeads(data.run?.prospects || []);
                } else {
                  setLeads([]);
                }
              } else {
                setLeads([]);
              }
            }

            if (event.type === "error") {
              setError(event.message || "Unknown error");
              setStage("idle");
            }
          } catch {
            // Skip malformed lines
          }
        }
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setError((err as Error).message || "Connection failed.");
        setStage("idle");
      }
    } finally {
      setLoading(false);
      if (!didCompleteRef.current) setStage("idle");
    }
  };

  const handleStop = () => {
    abortRef.current?.abort();
    setLoading(false);
    setStage("idle");
  };

  const isRunning = loading;
  const isDone = stage === "done" && !loading;

  return (
    <AppShell
      title="Scraper"
      subtitle="Describe your targets in natural language. The scraper finds, scores, and saves real leads."
    >
      <div className="flex flex-col gap-6">
        {/* ── Form ── */}
        <form
          onSubmit={handleSearch}
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#111]"
        >
          <div className="p-6 sm:p-8 space-y-5">
            {/* Target description */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Who are you looking for? *
              </label>
              <textarea
                placeholder="e.g. Airbnb concierge companies and property managers in Biarritz who manage short-term rentals..."
                required
                rows={3}
                value={form.targetDescription}
                onChange={(e) => setForm({ ...form, targetDescription: e.target.value })}
                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm font-medium outline-none transition focus:border-blue-400 focus:bg-white dark:border-white/10 dark:bg-white/5 dark:focus:border-blue-500 dark:focus:bg-white/[0.08] dark:text-white"
              />
            </div>

            {/* Location + Country + Industry */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  City / Region *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Biarritz, Annecy..."
                    required
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm font-medium outline-none transition focus:border-slate-400 focus:bg-white dark:border-white/10 dark:bg-white/5 dark:focus:border-white/30 dark:focus:bg-white/[0.08]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Country
                </label>
                <select
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-3 text-sm font-medium outline-none transition focus:border-slate-400 dark:border-white/10 dark:bg-white/5 dark:focus:border-white/30"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Industry
                </label>
                <select
                  value={form.industry}
                  onChange={(e) => setForm({ ...form, industry: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-3 text-sm font-medium outline-none transition focus:border-slate-400 dark:border-white/10 dark:bg-white/5 dark:focus:border-white/30"
                >
                  {INDUSTRIES.map((ind) => (
                    <option key={ind.value} value={ind.value}>{ind.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Advanced toggle */}
            <button
              type="button"
              onClick={() => setShowAdvanced((v) => !v)}
              className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            >
              {showAdvanced ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              Advanced options
            </button>

            {showAdvanced && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 pt-1">
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Extra keywords
                  </label>
                  <input
                    type="text"
                    placeholder="villa, superhost, luxury..."
                    value={form.keywords}
                    onChange={(e) => setForm({ ...form, keywords: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm outline-none transition focus:border-slate-400 dark:border-white/10 dark:bg-white/5 dark:focus:border-white/30"
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Negative keywords
                  </label>
                  <input
                    type="text"
                    placeholder="forum, reddit, facebook..."
                    value={form.negativeKeywords}
                    onChange={(e) => setForm({ ...form, negativeKeywords: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm outline-none transition focus:border-slate-400 dark:border-white/10 dark:bg-white/5 dark:focus:border-white/30"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Max leads
                  </label>
                  <select
                    value={form.maxResults}
                    onChange={(e) => setForm({ ...form, maxResults: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-3 text-sm outline-none transition focus:border-slate-400 dark:border-white/10 dark:bg-white/5"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={30}>30</option>
                    <option value={50}>50</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Pages / site
                  </label>
                  <select
                    value={form.maxPagesPerSite}
                    onChange={(e) => setForm({ ...form, maxPagesPerSite: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-3 text-sm outline-none transition focus:border-slate-400 dark:border-white/10 dark:bg-white/5"
                  >
                    <option value={1}>1</option>
                    <option value={2}>2</option>
                    <option value={3}>3</option>
                    <option value={5}>5</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-4 dark:border-white/5 dark:bg-white/[0.02]">
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
              Searches public web sources. No scraped PII databases.
            </p>
            <div className="flex items-center gap-3 ml-auto">
              {isRunning && (
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
                disabled={!form.targetDescription.trim() || !form.location.trim() || isRunning}
                className="flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-50 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
              >
                {isRunning ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                {isRunning ? "Running…" : "Find leads"}
              </button>
            </div>
          </div>
        </form>

        {/* ── Live Progress (shown while running or just done) ── */}
        {(isRunning || isDone) && (
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#111] overflow-hidden">
            {/* Stage bar */}
            {isRunning && stage !== "idle" && stage !== "done" && (
              <div className="px-6 pt-5 pb-2">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Stage
                  </span>
                  <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                    {STAGE_LABELS[stage]}…
                  </span>
                </div>
                <StageBar stage={stage} />
              </div>
            )}

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3 p-6 sm:grid-cols-4">
              <StatCard label="Queries run" value={stats.queriesRun} icon={Search} />
              <StatCard label="URLs found" value={stats.urlsFound} icon={Globe} />
              <StatCard label="Pages analyzed" value={stats.pagesAnalyzed} icon={Activity} />
              <StatCard label="Leads saved" value={stats.leadsSaved} icon={TrendingUp} />
            </div>

            {/* Live log */}
            {logs.length > 0 && (
              <div className="border-t border-slate-100 dark:border-white/5">
                <div className="flex items-center justify-between px-6 py-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Live log
                  </span>
                  <span className="flex items-center gap-1.5 text-[10px] text-slate-400">
                    <Zap className="h-3 w-3" />
                    {logs.length} entries
                  </span>
                </div>
                <div
                  ref={logRef}
                  className="h-48 overflow-y-auto px-6 pb-4 font-mono space-y-0.5"
                >
                  {logs.map((entry) => (
                    <LogLine key={entry.id} entry={entry} />
                  ))}
                  {isRunning && (
                    <div className="flex items-center gap-2 py-0.5">
                      <Loader2 className="h-3 w-3 animate-spin text-blue-400" />
                      <span className="text-xs text-blue-400">Running…</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Error ── */}
        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 dark:border-red-900/30 dark:bg-red-950/20">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-500 mt-0.5" />
            <div>
              <div className="text-sm font-semibold text-red-700 dark:text-red-400">Error</div>
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          </div>
        )}

        {/* ── Results ── */}
        {isDone && leads !== null && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {leads.length > 0 ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-amber-400" />
                )}
                <span className="text-base font-semibold text-slate-900 dark:text-white">
                  {leads.length === 0
                    ? "No leads saved — try different keywords or broader location."
                    : `${leads.length} lead${leads.length > 1 ? "s" : ""} saved`}
                </span>
                {stats.duplicatesSkipped > 0 && (
                  <span className="text-sm text-slate-400">
                    ({stats.duplicatesSkipped} duplicates merged)
                  </span>
                )}
              </div>
              {leads.length > 0 && scrapeRunId && (
                <Link
                  href={`/history/${scrapeRunId}`}
                  className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
                >
                  Run details
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>

            {leads.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 p-12 text-center dark:border-white/10">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  No real leads found. Try a broader description or different city.
                </p>
                <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
                  Tip: Add a SERPAPI_API_KEY or BRAVE_SEARCH_API_KEY in .env for much better search results.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {leads.map((lead) => (
                  <LeadCard key={lead.id} lead={lead} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Intro banner (no run yet) ── */}
        {!isRunning && stage === "idle" && leads === null && !error && (
          <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-6 dark:border-white/5 dark:bg-white/[0.02]">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
              How it works
            </h3>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                {
                  icon: Search,
                  label: "1. Searches the web",
                  desc: "Runs targeted queries on DuckDuckGo, SerpAPI, or Brave for your exact target.",
                },
                {
                  icon: Globe,
                  label: "2. Crawls websites",
                  desc: "Visits each result, discovers contact pages, extracts emails, phones & social links.",
                },
                {
                  icon: TrendingUp,
                  label: "3. Scores & saves",
                  desc: "Each lead gets a priority + confidence score with explainable signals before saving.",
                },
              ].map((s) => (
                <div key={s.label} className="flex items-start gap-3">
                  <div className="rounded-lg bg-slate-200 p-2 dark:bg-white/10">
                    <s.icon className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                  </div>
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
