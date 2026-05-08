import Link from "next/link";
import { ArrowUpRight, Brain, Mail, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScoreRing } from "@/components/score-ring";
import type { Prospect } from "@/lib/types";

const typeLabels: Record<Prospect["type"], string> = {
  individual_host: "Hôte individuel",
  concierge: "Conciergerie",
  agency: "Agence",
  multi_owner: "Multi-propriétaire",
  premium_host: "Hôte premium",
  unknown: "Inconnu",
};

export function ProspectTable({ prospects }: { prospects: Prospect[] }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035]">
      <div className="grid grid-cols-[1.4fr_0.8fr_0.8fr_0.7fr_1fr_0.7fr] gap-4 border-b border-white/10 px-5 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground max-xl:hidden">
        <div>Lead</div>
        <div>Marché</div>
        <div>Type</div>
        <div>Score</div>
        <div>Signaux</div>
        <div>Action</div>
      </div>
      <div className="divide-y divide-white/10">
        {prospects.map((prospect) => (
          <div key={prospect.id} className="grid gap-4 px-5 py-4 transition hover:bg-white/[0.04] xl:grid-cols-[1.4fr_0.8fr_0.8fr_0.7fr_1fr_0.7fr] xl:items-center">
            <div>
              <Link href={`/prospects/${prospect.id}`} className="group inline-flex items-center gap-2 font-medium text-white">
                {prospect.companyName || prospect.name}
                <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground transition group-hover:text-primary" />
              </Link>
              <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{prospect.listingTitle}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {prospect.contactEmail ? <Badge variant="success"><Mail className="mr-1 h-3 w-3" /> Email</Badge> : null}
                {prospect.contactPhone ? <Badge variant="default"><Phone className="mr-1 h-3 w-3" /> Téléphone</Badge> : null}
              </div>
            </div>
            <div className="text-sm text-muted-foreground">{prospect.city}, {prospect.country}</div>
            <div><Badge variant="violet">{typeLabels[prospect.type]}</Badge></div>
            <ScoreRing score={prospect.globalScore} size="sm" />
            <div className="flex flex-wrap gap-2">
              {prospect.painSignals.slice(0, 2).map((signal) => <Badge key={signal.id} variant={signal.severity === "high" ? "danger" : "warning"}>{signal.label}</Badge>)}
            </div>
            <Button asChild size="sm" variant="secondary">
              <Link href={`/prospects/${prospect.id}`}><Brain className="h-3.5 w-3.5" /> Analyser</Link>
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
