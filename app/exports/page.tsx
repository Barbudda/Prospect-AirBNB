import { Download, FileSpreadsheet, FileText, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ExportsPage() {
  return (
    <AppShell title="Exports" subtitle="Exporter les prospects et préparer des Opportunity Briefs pour l'action commerciale.">
      <div className="grid gap-6 md:grid-cols-3">
        <ExportCard icon={FileSpreadsheet} title="Prospects CSV" text="Export complet des leads, scores, statuts CRM, sources et tags." href="/api/export/prospects.csv" />
        <ExportCard icon={FileText} title="Opportunity Brief" text="Fiche synthétique PDF prévue pour V1.1, avec résumé IA et prochain angle." href="#" />
        <ExportCard icon={ShieldCheck} title="Export RGPD" text="Export/suppression des données utilisateur à brancher avec Supabase." href="/settings" />
      </div>
    </AppShell>
  );
}

function ExportCard({ icon: Icon, title, text, href }: { icon: typeof Download; title: string; text: string; href: string }) {
  return <Card><CardHeader><CardTitle className="flex items-center gap-2"><Icon className="h-5 w-5 text-primary" /> {title}</CardTitle></CardHeader><CardContent><p className="mb-5 text-sm leading-6 text-muted-foreground">{text}</p><Button asChild variant="secondary"><a href={href}><Download className="h-4 w-4" /> Télécharger</a></Button></CardContent></Card>;
}
