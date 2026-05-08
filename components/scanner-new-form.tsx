"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Loader2, Radar, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input, Select, Textarea } from "@/components/ui/input";

type CreatedRun = { id: string; name: string; city: string; status: string; progress: number; demoRunId?: string };

export function ScannerNewForm() {
  const [loading, setLoading] = useState(false);
  const [createdRun, setCreatedRun] = useState<CreatedRun | null>(null);

  async function createRun(formData: FormData) {
    setLoading(true);
    setCreatedRun(null);
    const payload = {
      objective: String(formData.get("objective")),
      city: String(formData.get("city") || "Biarritz"),
      country: String(formData.get("country") || "France"),
      neighborhood: String(formData.get("neighborhood") || ""),
      targetType: String(formData.get("targetType") || "Hôtes Airbnb et conciergeries"),
      sources: String(formData.get("sources") || "search_engine,reddit,forum,local_press").split(",").map((item) => item.trim()),
      keywords: String(formData.get("keywords") || "Airbnb problèmes voyageurs check-in parking"),
      language: String(formData.get("language") || "fr"),
      depth: String(formData.get("depth") || "standard"),
      volume: Number(formData.get("volume") || 25),
      prospectId: String(formData.get("prospectId") || "") || undefined,
    };
    const response = await fetch("/api/scanner/runs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const data = await response.json();
    setCreatedRun({ ...data.run, demoRunId: data.demoRunId });
    setLoading(false);
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Radar className="h-5 w-5 text-primary" /> Nouvelle recherche scanner</CardTitle>
          <p className="text-sm text-muted-foreground">Configuration public-only, connecteurs mockés V1 et future compatibilité API officielle.</p>
        </CardHeader>
        <CardContent>
          <form action={createRun} className="space-y-4">
            <Select name="objective" defaultValue="find_sales_angles">
              <option value="find_airbnb_hosts">Trouver des hôtes Airbnb</option>
              <option value="find_conciergeries">Trouver des conciergeries</option>
              <option value="find_guest_problems">Trouver des problèmes clients</option>
              <option value="find_owner_problems">Trouver des problèmes propriétaires</option>
              <option value="find_reddit_discussions">Trouver des discussions Reddit</option>
              <option value="find_forums">Trouver des forums</option>
              <option value="find_reviews">Trouver des avis</option>
              <option value="enrich_existing_prospect">Enrichir un prospect existant</option>
              <option value="understand_geo_zone">Comprendre une zone géographique</option>
              <option value="understand_property_type">Comprendre un type de logement</option>
              <option value="find_sales_angles">Trouver des angles commerciaux</option>
            </Select>
            <div className="grid gap-4 sm:grid-cols-2"><Input name="city" defaultValue="Biarritz" placeholder="Ville" /><Input name="country" defaultValue="France" placeholder="Pays" /></div>
            <Input name="neighborhood" defaultValue="Centre, Côte des Basques, Anglet" placeholder="Quartier ou zone" />
            <Input name="targetType" defaultValue="Hôtes premium et conciergeries" placeholder="Type de cible" />
            <Textarea name="keywords" defaultValue="Airbnb Biarritz parking check-in surf voyageurs internationaux conciergerie" placeholder="Mots-clés" />
            <Input name="sources" defaultValue="search_engine,reddit,forum,local_press,concierge_site,tourism_office,local_scraper" placeholder="Sources séparées par des virgules" />
            <div className="grid gap-4 sm:grid-cols-3"><Select name="language" defaultValue="fr"><option value="fr">Français</option><option value="en">Anglais</option></Select><Select name="depth" defaultValue="standard"><option value="surface">Surface</option><option value="standard">Standard</option><option value="deep">Deep</option></Select><Input name="volume" type="number" defaultValue="30" min="5" max="100" /></div>
            <Input name="prospectId" defaultValue="pros_biarritz_ocean" placeholder="Prospect existant optionnel" />
            <Button className="w-full" size="lg" disabled={loading}>{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Radar className="h-4 w-4" />} Lancer le scanner</Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" /> Radar intelligent</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-5 text-sm leading-6 text-emerald-100"><ShieldCheck className="mb-3 h-5 w-5" /> Le scanner V1 utilise des services internes et connecteurs mockés. Les futures APIs officielles seront isolées derrière les adaptateurs.</div>
          {createdRun ? <div className="rounded-3xl border border-primary/30 bg-primary/10 p-5"><Badge variant="success">Run créé</Badge><div className="mt-3 text-lg font-medium text-white">{createdRun.name}</div><div className="mt-1 text-sm text-muted-foreground">{createdRun.city} · {createdRun.status} · {createdRun.progress}%</div><Button asChild className="mt-5 w-full" variant="secondary"><Link href={`/scanner/runs/${createdRun.demoRunId ?? "scan_biarritz_airbnb_pains"}`}>Ouvrir le run enrichi <ArrowUpRight className="h-4 w-4" /></Link></Button></div> : <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.025] p-8 text-center text-sm text-muted-foreground">Configure une recherche pour détecter sources, signaux faibles, douleurs et angles commerciaux.</div>}
        </CardContent>
      </Card>
    </div>
  );
}
