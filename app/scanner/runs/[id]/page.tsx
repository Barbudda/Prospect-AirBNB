import Link from "next/link";
import { ArrowLeft, Brain, CheckCircle2, FileText, Play, Send, Sparkles, XCircle } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ScannerContextPanel } from "@/components/scanner-context-panel";
import { ScannerInsightCard } from "@/components/scanner-insight-card";
import { ScannerSourceList } from "@/components/scanner-source-list";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getLocationContextByCity, getPropertyContextByProspectId, getScannerInsightsByRunId, getScannerReportByRunId, getScannerRunById, getScannerSourcesByRunId } from "@/lib/scanner-mock-data";

export default function ScannerRunDetailPage({ params }: { params: { id: string } }) {
  const run = getScannerRunById(params.id);
  if (!run) {
    return <AppShell title="Run introuvable" subtitle="Ce run scanner n'existe pas."><Button asChild variant="secondary"><Link href="/scanner/runs"><ArrowLeft className="h-4 w-4" /> Retour</Link></Button></AppShell>;
  }

  const sources = getScannerSourcesByRunId(run.id);
  const insights = getScannerInsightsByRunId(run.id);
  const propertyContext = run.prospectId ? getPropertyContextByProspectId(run.prospectId) : null;
  const locationContext = getLocationContextByCity(run.city);
  const report = getScannerReportByRunId(run.id);

  return (
    <AppShell title={run.name} subtitle="Détail du scanner run : progression, logs, sources, insights, enrichissement et rapport." action={<Button asChild variant="secondary"><Link href="/scanner/runs"><ArrowLeft className="h-4 w-4" /> Runs</Link></Button>}>
      <div className="space-y-6">
        <section className="grid gap-4 md:grid-cols-4">
          <Metric label="Statut" value={run.status} icon={CheckCircle2} />
          <Metric label="Progression" value={`${run.progress}%`} icon={Play} />
          <Metric label="Sources" value={sources.length} icon={FileText} />
          <Metric label="Insights" value={insights.length} icon={Brain} />
        </section>

        <Card>
          <CardHeader className="flex-row items-center justify-between border-b border-white/10"><CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" /> Timeline de recherche</CardTitle><Badge variant="success">public-only</Badge></CardHeader>
          <CardContent className="space-y-3 pt-5">{run.logs.map((log, index) => <div key={log} className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-3 text-sm text-muted-foreground"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs text-primary">{index + 1}</span>{log}</div>)}</CardContent>
        </Card>

        <ScannerContextPanel insights={insights} propertyContext={propertyContext} locationContext={locationContext} />

        <section className="grid gap-6 xl:grid-cols-[1fr_0.85fr]">
          <Card>
            <CardHeader><CardTitle>Sources trouvées</CardTitle></CardHeader>
            <CardContent><ScannerSourceList sources={sources} /></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Rapport Concierge IA</CardTitle></CardHeader>
            <CardContent className="space-y-4 text-sm leading-6 text-muted-foreground">
              <p>{report?.executiveSummary ?? "Rapport généré à la demande via service interne."}</p>
              <div className="flex flex-wrap gap-2">{(report?.recommendedConciergeSetup.features ?? []).map((feature) => <Badge key={feature} variant="violet">{feature}</Badge>)}</div>
              <div className="grid gap-3 md:grid-cols-2"><Button><Send className="h-4 w-4" /> Envoyer vers CRM</Button><Button variant="secondary"><Sparkles className="h-4 w-4" /> Générer angles commerciaux</Button></div>
              <Button variant="secondary" className="w-full"><CheckCircle2 className="h-4 w-4" /> Préparer espace Concierge IA</Button>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">{insights.map((insight) => <ScannerInsightCard key={insight.id} insight={insight} />)}</section>
      </div>
    </AppShell>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof XCircle; label: string; value: string | number }) {
  return <Card className="p-5"><Icon className="mb-4 h-5 w-5 text-primary" /><div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div><div className="mt-2 text-2xl font-semibold text-white">{value}</div></Card>;
}
