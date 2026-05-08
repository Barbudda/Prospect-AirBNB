import { ExternalLink, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ScannedSource } from "@/lib/types";

export function ScannerSourceList({ sources }: { sources: ScannedSource[] }) {
  return (
    <div className="space-y-3">
      {sources.map((source) => (
        <div key={source.id} className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="font-medium text-white">{source.title}</div>
              <div className="mt-1 text-sm text-muted-foreground">{source.sourceName} · {source.sourceType}</div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="success"><ShieldCheck className="mr-1 h-3 w-3" /> {source.legalStatus}</Badge>
              <Badge variant="muted">rel {source.relevanceScore}</Badge>
              <Badge variant="muted">cred {source.credibilityScore}</Badge>
            </div>
          </div>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">{source.snippet}</p>
          <Button className="mt-4" asChild variant="secondary" size="sm"><a href={source.url} target="_blank"><ExternalLink className="h-3.5 w-3.5" /> Source</a></Button>
        </div>
      ))}
    </div>
  );
}
