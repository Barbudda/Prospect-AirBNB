"use client";

import { useEffect, useState, useCallback } from "react";
import { AppShell } from "@/components/app-shell";
import {
  Eye,
  Mail,
  Phone,
  Globe,
  Copy,
  Trash2,
  ExternalLink,
  Instagram,
  Facebook,
  Download,
  CheckCheck,
} from "lucide-react";
import Link from "next/link";

type Prospect = {
  id: string;
  name: string;
  city: string;
  country: string;
  targetType: string;
  source: string;
  sourceUrl: string;
  website: string | null;
  email: string | null;
  phone: string | null;
  instagram: string | null;
  facebook: string | null;
  priority: string;
  status: string;
  confidence: string;
  createdAt: string;
};

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "new", label: "New" },
  { value: "to_contact", label: "To contact" },
  { value: "contacted", label: "Contacted" },
  { value: "replied", label: "Replied" },
  { value: "meeting_scheduled", label: "Meeting scheduled" },
  { value: "interested", label: "Interested" },
  { value: "willing_to_pay", label: "Willing to pay" },
  { value: "not_interested", label: "Not interested" },
];

const TYPE_OPTIONS = [
  { value: "all", label: "All types" },
  { value: "concierge", label: "Concierge" },
  { value: "property_manager", label: "Property manager" },
  { value: "host_owner", label: "Host / Owner" },
  { value: "agency", label: "Agency" },
  { value: "unknown", label: "Unknown" },
];

const PRIORITY_OPTIONS = [
  { value: "all", label: "All priorities" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

function PriorityBadge({ priority }: { priority: string }) {
  const colors =
    priority === "high"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/30"
      : priority === "medium"
      ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/30"
      : "bg-slate-50 text-slate-600 border-slate-200 dark:bg-white/5 dark:text-slate-400 dark:border-white/10";

  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${colors}`}
    >
      {priority}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const label = status.replace(/_/g, " ");
  const colors =
    status === "willing_to_pay"
      ? "bg-emerald-500 text-white"
      : status === "interested"
      ? "bg-blue-500 text-white"
      : status === "meeting_scheduled"
      ? "bg-purple-500 text-white"
      : status === "replied"
      ? "bg-sky-500 text-white"
      : status === "contacted"
      ? "bg-slate-600 text-white"
      : status === "to_contact"
      ? "bg-amber-500 text-white"
      : "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300";

  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-medium ${colors}`}>
      {label}
    </span>
  );
}

export default function ContactsPage() {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    status: "all",
    priority: "all",
    targetType: "all",
    hasEmail: false,
    hasPhone: false,
  });

  const fetchProspects = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.status !== "all") params.set("status", filters.status);
    if (filters.priority !== "all") params.set("priority", filters.priority);
    if (filters.targetType !== "all") params.set("targetType", filters.targetType);
    if (filters.hasEmail) params.set("hasEmail", "true");
    if (filters.hasPhone) params.set("hasPhone", "true");

    const res = await fetch(`/api/prospects?${params}`);
    const data = await res.json();
    setProspects(data.prospects || []);
    setLoading(false);
  }, [filters]);

  useEffect(() => {
    fetchProspects();
  }, [fetchProspects]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this contact permanently?")) return;
    await fetch(`/api/prospects/${id}`, { method: "DELETE" });
    setProspects((prev) => prev.filter((p) => p.id !== id));
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleStatusChange = async (id: string, status: string) => {
    await fetch(`/api/prospects/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setProspects((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
  };

  return (
    <AppShell
      title="Contacts"
      subtitle="All real prospects found and saved from your searches."
      action={
        <a
          href="/api/export?format=csv"
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/[0.08]"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </a>
      }
    >
      <div className="flex flex-col gap-5">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 outline-none transition focus:border-slate-400 dark:border-white/10 dark:bg-[#111] dark:text-slate-300"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>

          <select
            value={filters.priority}
            onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 outline-none transition focus:border-slate-400 dark:border-white/10 dark:bg-[#111] dark:text-slate-300"
          >
            {PRIORITY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>

          <select
            value={filters.targetType}
            onChange={(e) => setFilters({ ...filters, targetType: e.target.value })}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 outline-none transition focus:border-slate-400 dark:border-white/10 dark:bg-[#111] dark:text-slate-300"
          >
            {TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>

          <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-600 dark:text-slate-400">
            <input
              type="checkbox"
              checked={filters.hasEmail}
              onChange={(e) => setFilters({ ...filters, hasEmail: e.target.checked })}
              className="rounded"
            />
            Has email
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-600 dark:text-slate-400">
            <input
              type="checkbox"
              checked={filters.hasPhone}
              onChange={(e) => setFilters({ ...filters, hasPhone: e.target.checked })}
              className="rounded"
            />
            Has phone
          </label>

          <span className="ml-auto text-sm text-slate-500 dark:text-slate-400">
            {prospects.length} contact{prospects.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#111]">
          {loading ? (
            <div className="p-12 text-center text-sm text-slate-400">Loading...</div>
          ) : prospects.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                No contacts yet
              </p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Use{" "}
                <Link
                  href="/search"
                  className="underline hover:text-slate-700 dark:hover:text-slate-300"
                >
                  Find Contacts
                </Link>{" "}
                to search for real prospects.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-100 bg-slate-50/80 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:border-white/5 dark:bg-white/[0.02] dark:text-slate-400">
                  <tr>
                    <th className="px-5 py-4">Name</th>
                    <th className="px-5 py-4">City</th>
                    <th className="px-5 py-4">Type</th>
                    <th className="px-5 py-4">Contact</th>
                    <th className="px-5 py-4">Priority</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-white/[0.03]">
                  {prospects.map((p) => (
                    <tr
                      key={p.id}
                      className="transition hover:bg-slate-50/50 dark:hover:bg-white/[0.02]"
                    >
                      {/* Name */}
                      <td className="px-5 py-3.5">
                        <div className="font-medium text-slate-900 dark:text-white truncate max-w-[200px]">
                          {p.name}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[200px] mt-0.5">
                          {p.source}
                        </div>
                      </td>

                      {/* City */}
                      <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {p.city}
                      </td>

                      {/* Type */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-600 dark:bg-white/10 dark:text-slate-300">
                          {p.targetType.replace("_", " ")}
                        </span>
                      </td>

                      {/* Contact icons */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          {p.email && (
                            <button
                              title={`Copy email: ${p.email}`}
                              onClick={() => handleCopy(p.email!, `email-${p.id}`)}
                              className="text-blue-500 hover:text-blue-700 transition"
                            >
                              {copied === `email-${p.id}` ? (
                                <CheckCheck className="h-4 w-4 text-emerald-500" />
                              ) : (
                                <Mail className="h-4 w-4" />
                              )}
                            </button>
                          )}
                          {p.phone && (
                            <button
                              title={`Copy phone: ${p.phone}`}
                              onClick={() => handleCopy(p.phone!, `phone-${p.id}`)}
                              className="text-emerald-500 hover:text-emerald-700 transition"
                            >
                              {copied === `phone-${p.id}` ? (
                                <CheckCheck className="h-4 w-4 text-emerald-500" />
                              ) : (
                                <Phone className="h-4 w-4" />
                              )}
                            </button>
                          )}
                          {p.website && (
                            <a
                              href={p.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Open website"
                              className="text-slate-400 hover:text-slate-600 transition"
                            >
                              <Globe className="h-4 w-4" />
                            </a>
                          )}
                          {p.instagram && (
                            <a
                              href={p.instagram}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Instagram"
                              className="text-pink-400 hover:text-pink-600 transition"
                            >
                              <Instagram className="h-4 w-4" />
                            </a>
                          )}
                          {p.facebook && (
                            <a
                              href={p.facebook}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Facebook"
                              className="text-blue-400 hover:text-blue-600 transition"
                            >
                              <Facebook className="h-4 w-4" />
                            </a>
                          )}
                          {!p.email && !p.phone && !p.website && !p.instagram && !p.facebook && (
                            <span className="text-[11px] text-slate-400">Not found</span>
                          )}
                        </div>
                      </td>

                      {/* Priority */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <PriorityBadge priority={p.priority} />
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <select
                          value={p.status}
                          onChange={(e) => handleStatusChange(p.id, e.target.value)}
                          className="rounded-lg border-0 bg-transparent text-[11px] font-medium focus:outline-none cursor-pointer"
                        >
                          {STATUS_OPTIONS.filter((o) => o.value !== "all").map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1.5">
                          <a
                            href={p.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Open source"
                            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-white/5"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                          <Link
                            href={`/contacts/${p.id}`}
                            title="View detail"
                            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-white/5 dark:hover:text-white"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Link>
                          <button
                            onClick={() => handleCopy(p.email || p.website || p.name, `copy-${p.id}`)}
                            title="Copy contact"
                            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-white/5"
                          >
                            {copied === `copy-${p.id}` ? (
                              <CheckCheck className="h-3.5 w-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            title="Delete"
                            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
