import { Brain, CheckCircle2, MapPinned, MessageSquare, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { LocationContext, PropertyContext, ScannerInsight } from "@/lib/types";

export function ScannerContextPanel({ insights, propertyContext, locationContext }: { insights: ScannerInsight[]; propertyContext?: Partial<PropertyContext> | null; locationContext?: LocationContext | null }) {
  return (
    <div className="grid gap-6 xl:grid-cols-3">
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Brain className="h-5 w-5 text-primary" /> AI reasoning</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
          <p>Le scanner combine signaux web publics, contexte géographique, type de logement et douleurs hôte/voyageur pour produire des angles commerciaux actionnables.</p>
          {insights.slice(0, 4).map((insight) => <div key={insight.id} className="rounded-2xl border border-white/10 bg-white/[0.035] p-3"><CheckCircle2 className="mb-2 h-4 w-4 text-primary" />{insight.label}</div>)}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" /> Property context</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Badge variant="violet">{propertyContext?.propertyType ?? "type à inférer"}</Badge>
          <div className="text-sm leading-6 text-muted-foreground">Profil : {propertyContext?.guestProfile ?? "voyageurs courte durée"}</div>
          <div className="flex flex-wrap gap-2">{(propertyContext?.operationalRisks ?? []).slice(0, 6).map((risk) => <Badge key={risk} variant="muted">{risk}</Badge>)}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><MapPinned className="h-5 w-5 text-primary" /> Location context</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm text-muted-foreground">{locationContext ? `${locationContext.city} · ${locationContext.tourismType}` : "Contexte local à enrichir"}</div>
          <div className="flex flex-wrap gap-2">{(locationContext?.commonGuestQuestions ?? []).slice(0, 5).map((question) => <Badge key={question} variant="warning"><MessageSquare className="mr-1 h-3 w-3" /> {question}</Badge>)}</div>
        </CardContent>
      </Card>
    </div>
  );
}
