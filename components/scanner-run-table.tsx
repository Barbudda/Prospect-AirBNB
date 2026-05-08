import Link from "next/link";
import { ArrowUpRight, Activity, Radar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ScannerRun } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export function ScannerRunTable({ runs }: { runs: ScannerRun[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10">
      <div className="grid grid-cols-[1.2fr_0.8fr_0.8fr_0.6fr_0.5fr] gap-3 border-b border-white/10 bg-white/[0.035] px-4 py-3 text-xs uppercase tracking-wide text-muted-foreground">
        <span>Run</span><span>Objectif</span><span>Sources</span><span>Statut</span><span />
      </div>
      {runs.map((run) => (
        <div key={run.id} className="grid grid-cols-[1.2fr_0.8fr_0.8fr_0.6fr_0.5fr] items-center gap-3 border-b border-white/10 px-4 py-4 last:border-b-0">
          <div>
            <div className="flex items-center gap-2 font-medium text-white"><Radar className="h-4 w-4 text-primary" /> {run.name}</div>
            <div className="mt-1 text-xs text-muted-foreground">{run.city}, {run.country} · {formatDate(run.updatedAt)}</div>
          </div>
          <div className="text-sm text-muted-foreground">{run.objective.replace(/_/g, " ")}</div>
          <div className="flex flex-wrap gap-1">{run.sources.slice(0, 3).map((source) => <Badge key={source} variant="muted">{source}</Badge>)}</div>
          <div>
            <Badge variant={run.status === "completed" ? "success" : run.status === "error" ? "warning" : "warning"}><Activity className="mr-1 h-3 w-3" /> {run.status}</Badge>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-primary" style={{ width: `${run.progress}%` }} /></div>
          </div>
          <div className="flex justify-end"><Button asChild variant="secondary" size="sm"><Link href={`/scanner/runs/${run.id}`}>Voir <ArrowUpRight className="h-3.5 w-3.5" /></Link></Button></div>
        </div>
      ))}
    </div>
  );
}
