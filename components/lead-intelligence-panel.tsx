import { AlertTriangle, ArrowRight, Brain, CheckCircle2, Gem, MessageSquare, Radar, ShieldQuestion, Sparkles, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScoreRing } from "@/components/score-ring";
import type { Prospect } from "@/lib/types";
import { estimateConciergeFit, recommendNextAction } from "@/lib/services/leadIntelligenceService";

export function LeadIntelligencePanel({ prospect }: { prospect: Prospect }) {
  const fit = estimateConciergeFit(prospect);
  const nextAction = recommendNextAction(prospect);
  const objection = prospect.tags.includes("concurrent détecté") ? "Nous avons déjà un livret digital / PMS." : "Je n'ai pas le temps de configurer un nouvel outil.";

  return (
    <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
      <Card className="overflow-hidden">
        <CardHeader className="border-b border-white/10 bg-white/[0.025]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2"><Brain className="h-5 w-5 text-primary" /> Lead Intelligence Map</CardTitle>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{prospect.aiSummary}</p>
            </div>
            <ScoreRing score={fit} label="Concierge Fit" size="lg" />
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 pt-5 md:grid-cols-2">
          <InsightBlock icon={CheckCircle2} title="Signaux positifs" items={[`${prospect.estimatedProperties} bien(s) estimé(s)`, `${prospect.contactabilityScore}/100 contactabilité`, ...prospect.opportunities.slice(0, 2)]} tone="emerald" />
          <InsightBlock icon={AlertTriangle} title="Signaux de douleur" items={prospect.painSignals.map((signal) => signal.label)} tone="amber" />
          <InsightBlock icon={Gem} title="Opportunités" items={prospect.opportunities} tone="violet" />
          <InsightBlock icon={ShieldQuestion} title="Objection probable" items={[objection, "Réponse : proposer une démo configurée depuis leurs documents existants."]} tone="rose" />
        </CardContent>
      </Card>

      <div className="space-y-5">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Radar className="h-5 w-5 text-primary" /> Pourquoi ce lead ?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <ScoreLine label="Besoin IA conciergerie" value={prospect.conciergeNeedScore} />
            <ScoreLine label="Probabilité d'achat" value={prospect.buyingProbabilityScore} />
            <ScoreLine label="Facilité de contact" value={prospect.contactabilityScore} />
            <ScoreLine label="Maturité digitale" value={prospect.digitalMaturityScore} />
            <p className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 leading-6">{prospect.outreachAngle}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Target className="h-5 w-5 text-primary" /> Next Best Action</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-2xl border border-primary/20 bg-primary/10 p-4 text-sm leading-6 text-primary-foreground/90">{nextAction}</div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button size="sm"><Sparkles className="h-3.5 w-3.5" /> Trouver le meilleur angle</Button>
              <Button size="sm" variant="secondary"><MessageSquare className="h-3.5 w-3.5" /> Préparer ma prise de contact</Button>
              <Button size="sm" variant="secondary"><ArrowRight className="h-3.5 w-3.5" /> Créer espace conciergerie IA</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function InsightBlock({ icon: Icon, title, items, tone }: { icon: typeof Brain; title: string; items: string[]; tone: "emerald" | "amber" | "violet" | "rose" }) {
  const tones = {
    emerald: "text-emerald-200 bg-emerald-400/10 border-emerald-400/20",
    amber: "text-amber-200 bg-amber-400/10 border-amber-400/20",
    violet: "text-violet-200 bg-violet-400/10 border-violet-400/20",
    rose: "text-rose-200 bg-rose-400/10 border-rose-400/20",
  };
  return (
    <div className={`rounded-2xl border p-4 ${tones[tone]}`}>
      <div className="mb-3 flex items-center gap-2 font-medium"><Icon className="h-4 w-4" /> {title}</div>
      <div className="space-y-2">
        {items.slice(0, 4).map((item) => <div key={item} className="text-sm leading-5 opacity-85">{item}</div>)}
      </div>
    </div>
  );
}

function ScoreLine({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between"><span>{label}</span><span className="text-white">{value}</span></div>
      <div className="h-2 rounded-full bg-white/10"><div className="h-2 rounded-full premium-gradient" style={{ width: `${value}%` }} /></div>
    </div>
  );
}
