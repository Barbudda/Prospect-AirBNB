import { Lightbulb } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ScannerInsightCard } from "@/components/scanner-insight-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/input";
import { mockScannerInsights } from "@/lib/scanner-mock-data";

export default function ScannerInsightsPage() {
  return (
    <AppShell title="Insights Scanner" subtitle="Bibliothèque d'insights commerciaux détectés sur sources publiques et mockées.">
      <div className="space-y-6">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Lightbulb className="h-5 w-5 text-primary" /> Filtres</CardTitle></CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-4">
            <Input placeholder="Rechercher un problème" />
            <Select><option>Toutes villes</option><option>Biarritz</option><option>Chamonix</option><option>Paris</option></Select>
            <Select><option>Tous types</option><option>location_pain</option><option>guest_problem</option><option>upsell_opportunity</option></Select>
            <Select><option>Toutes sévérités</option><option>high</option><option>medium</option><option>low</option></Select>
          </CardContent>
        </Card>
        <section className="grid gap-6 xl:grid-cols-2">{mockScannerInsights.map((insight) => <ScannerInsightCard key={insight.id} insight={insight} />)}</section>
      </div>
    </AppShell>
  );
}
