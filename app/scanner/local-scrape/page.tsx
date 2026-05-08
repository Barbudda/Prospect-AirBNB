import { Globe, Server, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { LocalScrapeForm } from "@/components/local-scrape-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getLocalScraperStatus } from "@/lib/services/localScraperAdapter";

export default function LocalScrapePage() {
  const status = getLocalScraperStatus();
  return (
    <AppShell title="Local scraper adapter" subtitle="Importer une URL publique via le scraper FastAPI local, derrière une route interne Prospect.">
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Server className="h-5 w-5 text-primary" /> Statut adaptateur</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Badge variant={status.enabled ? "success" : "muted"}>{status.enabled ? "enabled" : "disabled"}</Badge>
            <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-sm text-muted-foreground">Base URL : {status.baseUrl ?? "non configurée"}</div>
            <div className="space-y-2">{status.legalNotes.map((note) => <div key={note} className="flex gap-2 text-sm text-muted-foreground"><ShieldCheck className="h-4 w-4 text-primary" /> {note}</div>)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Globe className="h-5 w-5 text-primary" /> Importer une URL</CardTitle></CardHeader>
          <CardContent><LocalScrapeForm /></CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
