import Link from "next/link";
import { ArrowRight, LockKeyhole, Radar, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6 subtle-grid">
      <div className="w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.045] shadow-panel backdrop-blur-2xl">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
          <section className="relative min-h-[560px] overflow-hidden p-8 sm:p-12">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 via-violet-500/10 to-transparent" />
            <div className="relative z-10 flex h-full flex-col justify-between">
              <div>
                <div className="mb-10 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl premium-gradient text-slate-950 shadow-glow"><Radar className="h-6 w-6" /></div>
                  <div>
                    <div className="text-xl font-semibold">Prospect</div>
                    <div className="text-sm text-muted-foreground">Lead Intelligence Cockpit</div>
                  </div>
                </div>
                <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-white sm:text-6xl">Une machine de prospection intelligente, pas une liste de liens.</h1>
                <p className="mt-6 max-w-lg text-lg leading-8 text-muted-foreground">Scoring IA, détection de douleurs, CRM et préparation commerciale pour vendre ton futur majordome IA Airbnb.</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {['Lead Radar', 'Hidden Pain Detector', 'Concierge Fit'].map((item) => <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.05] p-4 text-sm text-white"><Sparkles className="mb-3 h-4 w-4 text-primary" />{item}</div>)}
              </div>
            </div>
          </section>
          <section className="flex items-center p-6 sm:p-10">
            <Card className="w-full border-white/10 bg-slate-950/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><LockKeyhole className="h-5 w-5 text-primary" /> Connexion</CardTitle>
                <p className="text-sm text-muted-foreground">Mode démo V1 : accès direct sans authentification Supabase active.</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input type="email" placeholder="you@company.com" defaultValue="founder@prospect.ai" />
                <Input type="password" placeholder="••••••••" defaultValue="prospect-demo" />
                <Button asChild className="w-full" size="lg"><Link href="/dashboard">Entrer dans le cockpit <ArrowRight className="h-4 w-4" /></Link></Button>
                <p className="text-xs leading-5 text-muted-foreground">L'auth sera branchée à Supabase en production. Aucune donnée sensible n'est collectée en démo.</p>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </main>
  );
}
