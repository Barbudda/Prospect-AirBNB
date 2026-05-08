import { Database } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ScannerSourceList } from "@/components/scanner-source-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockScannedSources } from "@/lib/scanner-mock-data";

export default function ScannerSourcesPage() {
  return (
    <AppShell title="Sources Scanner" subtitle="Sources publiques normalisées avec score de pertinence, crédibilité et statut légal.">
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Database className="h-5 w-5 text-primary" /> Sources analysées</CardTitle></CardHeader>
        <CardContent><ScannerSourceList sources={mockScannedSources} /></CardContent>
      </Card>
    </AppShell>
  );
}
