import Link from "next/link";
import { Activity, Brain, Database, Lightbulb, Plus, Radar, Search, Sparkles, Target } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ScannerInsightCard } from "@/components/scanner-insight-card";
import { ScannerRunTable } from "@/components/scanner-run-table";
import { StatCard } from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mockScannedSources, mockScannerInsights, mockScannerRuns } from "@/lib/scanner-mock-data";

export default function ScannerPage() {
  const completedRuns = mockScannerRuns.filter((run) => run.status === "completed").length;
  const enrichedProspects = new Set(mockScannerInsights.map((insight) => insight.prospectId).filter(Boolean)).size;
  const dominantPainPoints = [...new Set(mockScannerInsights.map((insight) => insight.label))].slice(0, 5);

  return (
    <AppShell title="Prospect Web Scanner" subtitle="Radar intelligent pour comprendre les besoins cachés du marché Airbnb à partir de sources publiques." action={<Button asChild><Link href="/scanner/new"><Plus className="h-4 w-4" /> Nouvelle recherche intelligente</Link></Button>}>
      <div className="space-y-6">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <StatCard icon={Search} label="Sources analysées" value={mockScannedSources.length} detail="Pages, forums, Reddit mock, presse, annuaires" />
          <StatCard icon={Lightbulb} label="Insights détectés" value={mockScannerInsights.length} detail="Pain points et angles commerciaux" />
          <StatCard icon={Target} label="Prospects enrichis" value={enrichedProspects} detail="Fiches reliées au scanner" />
          <StatCard icon={Activity} label="Runs terminés" value={completedRuns} detail="Scans public-only exécutés" />
          <StatCard icon={Brain} label="Mode API" value="Interne" detail="Aucun appel externe direct depuis l'UI" />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <Card>
            <CardHeader className="flex-row items-center justify-between border-b border-white/10">
              <div><CardTitle className="flex items-center gap-2"><Radar className="h-5 w-5 text-primary" /> Runs récents</CardTitle><p className="mt-1 text-sm text-muted-foreground">Suivi des recherches, progression, sources et état d'analyse IA.</p></div>
              <Badge variant="success">Legal scanner</Badge>
            </CardHeader>
            <CardContent className="pt-5"><ScannerRunTable runs={mockScannerRuns} /></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" /> Top pain points</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {dominantPainPoints.map((pain, index) => <div key={pain} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.035] p-3"><span className="text-sm text-white">{pain}</span><Badge variant={index < 2 ? "warning" : "muted"}>{90 - index * 8}%</Badge></div>)}
              <Button asChild variant="secondary" className="w-full"><Link href="/scanner/insights">Explorer les insights</Link></Button>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          {mockScannerInsights.slice(0, 2).map((insight) => <ScannerInsightCard key={insight.id} insight={insight} />)}
        </section>
      </div>
    </AppShell>
  );
}
