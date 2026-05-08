"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import {
  Trophy,
  Crown,
  Users,
  MessageSquare,
  CheckCircle2,
  CalendarCheck,
  Flame,
  Eye,
  Search,
} from "lucide-react";
import Link from "next/link";

type Stats = {
  totalFound: number;
  contactable: number;
  contacted: number;
  replied: number;
  meetings: number;
  interested: number;
  willingToPay: number;
};

type HotProspect = {
  id: string;
  name: string;
  city: string;
  targetType: string;
  status: string;
  willingToPay: boolean;
  email: string | null;
  phone: string | null;
};

const GOAL = 20;

function StatCard({
  icon: Icon,
  value,
  label,
  highlight,
}: {
  icon: React.ElementType;
  value: number;
  label: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 shadow-sm ${
        highlight
          ? "border-orange-200 bg-orange-50 dark:border-orange-900/30 dark:bg-orange-950/20"
          : "border-slate-200 bg-white dark:border-white/10 dark:bg-[#111]"
      }`}
    >
      <Icon
        className={`h-5 w-5 mb-3 ${
          highlight ? "text-yellow-600 dark:text-yellow-500" : "text-slate-400"
        }`}
      />
      <div className="text-2xl font-semibold text-slate-900 dark:text-white">{value}</div>
      <div className="mt-1 text-xs font-medium uppercase tracking-wider text-slate-500">
        {label}
      </div>
    </div>
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
      : "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300";

  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-medium ${colors}`}>
      {label}
    </span>
  );
}

export default function EarlyAdoptersPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [hotProspects, setHotProspects] = useState<HotProspect[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/early-adopters")
      .then((r) => r.json())
      .then((data) => {
        setStats(data.stats);
        setHotProspects(data.hotProspects || []);
        setLoading(false);
      });
  }, []);

  const progressPercent = stats
    ? Math.min((stats.willingToPay / GOAL) * 100, 100)
    : 0;

  return (
    <AppShell
      title="Early Adopters"
      subtitle="Track your market validation progress toward the first 20 paying clients."
    >
      {loading ? (
        <div className="p-12 text-center text-sm text-slate-400">Loading...</div>
      ) : (
        <div className="flex flex-col gap-8">
          {/* Goal Block */}
          <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm dark:border-white/10 dark:bg-[#111]">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400">
                <Trophy className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
                  Market Validation Goal{" "}
                  <Crown className="h-5 w-5 text-yellow-500" />
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Find 20 early adopters willing to pay to validate product launch.
                </p>

                <div className="mt-6">
                  <div className="mb-2 flex justify-between text-sm font-medium">
                    <span className="text-slate-700 dark:text-slate-300">
                      {stats?.willingToPay ?? 0} validated of {GOAL}
                    </span>
                    <span className="text-slate-400">{Math.round(progressPercent)}%</span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-orange-400 to-amber-400 transition-all duration-1000"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            <StatCard icon={Users} value={stats?.totalFound ?? 0} label="Found" />
            <StatCard icon={CheckCircle2} value={stats?.contactable ?? 0} label="Contactable" />
            <StatCard icon={MessageSquare} value={stats?.contacted ?? 0} label="Contacted" />
            <StatCard icon={CheckCircle2} value={stats?.replied ?? 0} label="Replied" />
            <StatCard icon={CalendarCheck} value={stats?.meetings ?? 0} label="Meetings" />
            <StatCard
              icon={Crown}
              value={stats?.willingToPay ?? 0}
              label="Willing to pay"
              highlight
            />
          </div>

          {/* Hot Prospects Table */}
          <div>
            <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-white">
              <Flame className="h-5 w-5 text-orange-500" />
              Hot prospects
            </h3>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#111]">
              {hotProspects.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    No hot prospects yet
                  </p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Mark prospects as "Interested" or "Willing to pay" to see them here.
                  </p>
                  <Link
                    href="/search"
                    className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  >
                    <Search className="h-4 w-4" />
                    Find contacts
                  </Link>
                </div>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-slate-100 bg-slate-50/80 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:border-white/5 dark:bg-white/[0.02] dark:text-slate-400">
                    <tr>
                      <th className="px-5 py-4">Name</th>
                      <th className="px-5 py-4">City</th>
                      <th className="px-5 py-4">Status</th>
                      <th className="px-5 py-4">Contact</th>
                      <th className="px-5 py-4">Willing to pay</th>
                      <th className="px-5 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-white/[0.03]">
                    {hotProspects.map((p) => (
                      <tr
                        key={p.id}
                        className="transition hover:bg-slate-50/50 dark:hover:bg-white/[0.02]"
                      >
                        <td className="px-5 py-3.5 font-medium text-slate-900 dark:text-white">
                          {p.name}
                        </td>
                        <td className="px-5 py-3.5 text-slate-500">{p.city}</td>
                        <td className="px-5 py-3.5">
                          <StatusBadge status={p.status} />
                        </td>
                        <td className="px-5 py-3.5 text-slate-500 text-xs">
                          {p.email || p.phone || "—"}
                        </td>
                        <td className="px-5 py-3.5">
                          {p.willingToPay ? (
                            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium text-sm">
                              <CheckCircle2 className="h-4 w-4" />
                              Yes
                            </span>
                          ) : (
                            <span className="text-slate-400 text-sm">—</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <Link
                            href={`/contacts/${p.id}`}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Export */}
          <div className="flex gap-3">
            <a
              href="/api/export?format=csv"
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:bg-[#111] dark:text-slate-300 dark:hover:bg-white/5"
            >
              Export CSV
            </a>
            <a
              href="/api/export?format=json"
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:bg-[#111] dark:text-slate-300 dark:hover:bg-white/5"
            >
              Export JSON
            </a>
          </div>
        </div>
      )}
    </AppShell>
  );
}
