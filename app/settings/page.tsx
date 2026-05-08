"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Globe,
  Download,
  Trash2,
  Key,
} from "lucide-react";

type Source = {
  id: string;
  label: string;
  description: string;
  status: "enabled" | "not_configured" | "error";
};

type SettingsData = {
  sources: Source[];
  senderName: string;
  totalProspects: number;
};

function SourceStatus({ status }: { status: Source["status"] }) {
  if (status === "enabled")
    return (
      <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Active
      </span>
    );
  if (status === "error")
    return (
      <span className="flex items-center gap-1.5 text-xs font-medium text-red-500">
        <XCircle className="h-3.5 w-3.5" />
        Error
      </span>
    );
  return (
    <span className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
      <AlertCircle className="h-3.5 w-3.5" />
      Not configured
    </span>
  );
}

export default function SettingsPage() {
  const [data, setData] = useState<SettingsData | null>(null);
  const [senderName, setSenderName] = useState("");
  const [saved, setSaved] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetch("/api/settings/status")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        // Prefer localStorage for sender name (client-side only)
        const stored = localStorage.getItem("prospect_sender_name");
        setSenderName(stored || d.senderName || "");
      });
  }, []);

  const handleSaveName = () => {
    localStorage.setItem("prospect_sender_name", senderName);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleDeleteAll = async () => {
    if (
      !confirm(
        `Delete all ${data?.totalProspects} contacts permanently? This cannot be undone.`
      )
    )
      return;

    setDeleting(true);
    // Delete all prospects via multiple calls (simple approach)
    const res = await fetch("/api/prospects");
    const { prospects } = await res.json();
    await Promise.all(
      prospects.map((p: { id: string }) =>
        fetch(`/api/prospects/${p.id}`, { method: "DELETE" })
      )
    );
    setData((prev) => (prev ? { ...prev, totalProspects: 0 } : prev));
    setDeleting(false);
  };

  return (
    <AppShell
      title="Settings"
      subtitle="Configure search sources, outreach preferences, and data management."
    >
      <div className="grid gap-6 max-w-3xl">
        {/* Search Sources */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#111]">
          <div className="flex items-center gap-3 mb-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
              <Globe className="h-4 w-4" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              Search Sources
            </h3>
          </div>

          <div className="space-y-3">
            {data?.sources.map((source) => (
              <div
                key={source.id}
                className={`flex items-start justify-between rounded-xl border p-4 ${
                  source.status === "enabled"
                    ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/30 dark:bg-emerald-950/10"
                    : "border-slate-200 dark:border-white/10"
                }`}
              >
                <div>
                  <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {source.label}
                  </div>
                  <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    {source.description}
                  </div>
                </div>
                <SourceStatus status={source.status} />
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-white/5 dark:bg-white/[0.02]">
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              <strong className="text-slate-800 dark:text-slate-200">
                To add API keys:
              </strong>{" "}
              Edit the <code className="rounded bg-slate-200 px-1 dark:bg-white/10">.env</code>{" "}
              file in the project root and restart the server.
              <br />
              <code className="mt-1 block text-[11px] text-slate-500">
                SERPAPI_API_KEY=your_key_here
              </code>
              <code className="block text-[11px] text-slate-500">
                GOOGLE_MAPS_API_KEY=your_key_here
              </code>
            </p>
          </div>
        </div>

        {/* Outreach preferences */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#111]">
          <div className="flex items-center gap-3 mb-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
              <Key className="h-4 w-4" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              Outreach Settings
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Your Name (used in outreach messages)
              </label>
              <input
                type="text"
                placeholder="e.g. Hugo from Antigravity"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:bg-white dark:border-white/10 dark:bg-white/5 dark:focus:border-white/30"
              />
              <p className="mt-1.5 text-xs text-slate-400">
                Stored locally in your browser. Set{" "}
                <code className="rounded bg-slate-100 px-1 dark:bg-white/10">SENDER_NAME</code>{" "}
                in .env for server-side use.
              </p>
            </div>

            <button
              onClick={handleSaveName}
              className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900"
            >
              {saved ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : null}
              {saved ? "Saved!" : "Save preferences"}
            </button>
          </div>
        </div>

        {/* Export */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#111]">
          <div className="flex items-center gap-3 mb-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-400">
              <Download className="h-4 w-4" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              Export Data
            </h3>
          </div>

          <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
            Download all your contacts for use in external tools. Currently{" "}
            <strong className="text-slate-700 dark:text-slate-300">
              {data?.totalProspects ?? 0}
            </strong>{" "}
            contacts.
          </p>

          <div className="flex flex-wrap gap-3">
            <a
              href="/api/export?format=csv"
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
            >
              <Download className="h-4 w-4 text-blue-500" />
              Export CSV (Excel)
            </a>
            <a
              href="/api/export?format=json"
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
            >
              <Download className="h-4 w-4 text-purple-500" />
              Export JSON (API)
            </a>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm dark:border-red-900/30 dark:bg-[#111]">
          <h3 className="mb-2 text-base font-semibold text-red-700 dark:text-red-400">
            Danger Zone
          </h3>
          <p className="mb-5 text-sm text-slate-500 dark:text-slate-400">
            Delete all contacts from the database. This action is permanent.
          </p>
          <button
            onClick={handleDeleteAll}
            disabled={deleting || (data?.totalProspects ?? 0) === 0}
            className="flex items-center gap-2 rounded-xl border border-red-300 bg-red-50 px-5 py-2.5 text-sm font-medium text-red-700 transition hover:bg-red-100 disabled:opacity-50 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-400"
          >
            <Trash2 className="h-4 w-4" />
            {deleting ? "Deleting..." : `Delete all contacts (${data?.totalProspects ?? 0})`}
          </button>
        </div>
      </div>
    </AppShell>
  );
}
