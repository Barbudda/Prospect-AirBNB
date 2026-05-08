import { Flame, Lightbulb, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ScannerInsight } from "@/lib/types";

export function ScannerInsightCard({ insight }: { insight: ScannerInsight }) {
  return (
    <Card className="transition hover:border-primary/30">
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="flex items-center gap-2"><Lightbulb className="h-5 w-5 text-primary" /> {insight.label}</CardTitle>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{insight.description}</p>
        </div>
        <Badge variant={insight.severity === "high" ? "warning" : insight.severity === "medium" ? "violet" : "muted"}>{insight.severity}</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-3">
          <Metric icon={Flame} label="Fréquence" value={`${insight.frequency}%`} />
          <Metric icon={Target} label="Confiance" value={`${insight.confidenceScore}%`} />
          <Metric icon={Lightbulb} label="Feature" value={insight.recommendedConciergeFeature} />
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-sm leading-6 text-muted-foreground">
          <span className="font-medium text-white">Angle commercial : </span>{insight.outreachAngle}
        </div>
        <div className="text-xs text-muted-foreground">Evidence : {insight.evidence}</div>
      </CardContent>
    </Card>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof Flame; label: string; value: string }) {
  return <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3"><Icon className="mb-2 h-4 w-4 text-primary" /><div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div><div className="mt-1 text-sm font-medium text-white">{value}</div></div>;
}
