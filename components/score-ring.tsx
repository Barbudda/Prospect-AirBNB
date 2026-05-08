import { cn, getScoreTone } from "@/lib/utils";

export function ScoreRing({ score, label, size = "md" }: { score: number; label?: string; size?: "sm" | "md" | "lg" }) {
  const dimensions = size === "lg" ? "h-28 w-28" : size === "sm" ? "h-14 w-14" : "h-20 w-20";
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex items-center gap-3">
      <div className={cn("relative", dimensions)}>
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
          <circle cx="50" cy="50" r={radius} className="fill-none stroke-white/10" strokeWidth="8" />
          <circle cx="50" cy="50" r={radius} className="fill-none stroke-emerald-300 transition-all" strokeWidth="8" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-lg font-semibold text-white">{score}</div>
      </div>
      {label ? (
        <div>
          <div className="text-sm font-medium text-white">{label}</div>
          <div className={cn("mt-1 rounded-full border px-2 py-0.5 text-xs", getScoreTone(score))}>Score IA</div>
        </div>
      ) : null}
    </div>
  );
}
