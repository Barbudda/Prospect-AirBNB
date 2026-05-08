import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPercent(value: number) {
  return `${Math.round(value)}%`;
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}

export function getScoreTone(score: number) {
  if (score >= 82) return "text-emerald-300 border-emerald-400/30 bg-emerald-400/10";
  if (score >= 68) return "text-cyan-300 border-cyan-400/30 bg-cyan-400/10";
  if (score >= 50) return "text-amber-300 border-amber-400/30 bg-amber-400/10";
  return "text-rose-300 border-rose-400/30 bg-rose-400/10";
}
