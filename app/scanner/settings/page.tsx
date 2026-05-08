import Link from "next/link";
import { Camera, Eye, Globe2, Image, KeyRound, Map, Server, ShieldCheck, Workflow } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getLocalScraperStatus } from "@/lib/services/localScraperAdapter";

const v3Cards = [
  [Camera, "Photo Analysis"],
  [Map, "Street View Context"],
  [Eye, "Visual Property Classifier"],
  [Globe2, "Neighborhood Visual Signals"],
  [Image, "Image Matching"],
];

export default function ScannerSettingsPage() {
  const localScraperStatus = getLocalScraperStatus();
  return (
    <AppShell title="Scanner settings" subtitle="Gouvernance, connecteurs, limites et placeholders V3 Intelligence visuelle.">
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary" /> Politique scanner</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-sm leading-6 text-muted-foreground">
            <p>Par défaut, Prospect Web Scanner privilégie les API internes, mocks, cache et services abstraits. Toute API externe future doit passer par un connecteur contrôlé.</p>
            <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">Respect robots.txt, conditions d'utilisation, RGPD, quotas, sources publiques et traçabilité des preuves.</div>
            <Button variant="secondary"><KeyRound className="h-4 w-4" /> Configurer secrets API officiels</Button>
            <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-white"><Server className="h-4 w-4 text-primary" /> Scraper local</span>
                <Badge variant={localScraperStatus.enabled ? "success" : "muted"}>{localScraperStatus.enabled ? "enabled" : "disabled"}</Badge>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{localScraperStatus.baseUrl ?? "Configure LOCAL_SCRAPER_API_URL pour activer l'adaptateur."}</p>
              <Button asChild className="mt-3 w-full" variant="secondary" size="sm"><Link href="/scanner/local-scrape">Tester l'adaptateur local</Link></Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Workflow className="h-5 w-5 text-primary" /> V3 Intelligence visuelle</CardTitle></CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {v3Cards.map(([Icon, label]) => <div key={String(label)} className="rounded-2xl border border-white/10 bg-white/[0.035] p-4"><Icon className="mb-3 h-5 w-5 text-primary" /><div className="font-medium text-white">{String(label)}</div><Badge className="mt-3" variant="muted">Coming soon</Badge></div>)}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
