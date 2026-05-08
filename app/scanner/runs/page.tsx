import Link from "next/link";
import { Plus, Radar } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ScannerRunTable } from "@/components/scanner-run-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockScannerRuns } from "@/lib/scanner-mock-data";

export default function ScannerRunsPage() {
  return (
    <AppShell title="Scanner runs" subtitle="Historique des recherches web internes, publiques et traçables." action={<Button asChild><Link href="/scanner/new"><Plus className="h-4 w-4" /> Nouveau run</Link></Button>}>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Radar className="h-5 w-5 text-primary" /> Runs</CardTitle></CardHeader>
        <CardContent><ScannerRunTable runs={mockScannerRuns} /></CardContent>
      </Card>
    </AppShell>
  );
}
