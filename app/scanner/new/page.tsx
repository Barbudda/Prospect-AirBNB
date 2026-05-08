import { AppShell } from "@/components/app-shell";
import { ScannerNewForm } from "@/components/scanner-new-form";

export default function ScannerNewPage() {
  return (
    <AppShell title="Nouvelle recherche Scanner" subtitle="Lance une recherche web intelligente pour découvrir leads, douleurs marché et besoins cachés.">
      <ScannerNewForm />
    </AppShell>
  );
}
