"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Brain, Loader2, Radar, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

type SearchResult = { id: string; title: string; city: string; sourceName: string; snippet: string; estimatedProperties?: number };

export function SearchCampaignForm() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);

  async function runSearch(formData: FormData) {
    setLoading(true);
    setResults([]);
    const payload = {
      city: String(formData.get("city") || "Biarritz"),
      country: String(formData.get("country") || "France"),
      radiusOrDistrict: String(formData.get("radiusOrDistrict") || "Centre"),
      targetType: String(formData.get("targetType") || "Hôtes premium et conciergeries"),
      desiredVolume: Number(formData.get("desiredVolume") || 20),
      keywords: String(formData.get("keywords") || "airbnb conciergerie"),
      language: String(formData.get("language") || "fr"),
      aggressiveness: String(formData.get("aggressiveness") || "standard"),
    };
    const response = await fetch("/api/search/run", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const data = await response.json();
    setResults(data.results ?? []);
    setLoading(false);
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Search className="h-5 w-5 text-primary" /> Nouvelle campagne</CardTitle>
          <p className="text-sm text-muted-foreground">Lance une recherche multi-source simulée, structurée comme un futur connecteur Google, SerpAPI, Apify ou Playwright.</p>
        </CardHeader>
        <CardContent>
          <form action={runSearch} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input name="city" placeholder="Ville" defaultValue="Biarritz" />
              <Input name="country" placeholder="Pays" defaultValue="France" />
            </div>
            <Input name="radiusOrDistrict" placeholder="Rayon ou quartier" defaultValue="Centre, Côte des Basques, Anglet" />
            <Select name="targetType" defaultValue="Hôtes Airbnb premium et conciergeries">
              <option>Hôtes Airbnb premium et conciergeries</option>
              <option>Hôte individuel</option>
              <option>Conciergerie</option>
              <option>Multi-propriétaire</option>
              <option>Logement avec mauvais avis</option>
              <option>Marché touristique</option>
            </Select>
            <div className="grid gap-4 sm:grid-cols-3">
              <Input name="desiredVolume" type="number" min="5" max="100" defaultValue="20" />
              <Select name="language" defaultValue="fr"><option value="fr">Français</option><option value="en">Anglais</option><option value="es">Espagnol</option></Select>
              <Select name="aggressiveness" defaultValue="standard"><option value="careful">Prudent</option><option value="standard">Standard</option><option value="wide">Large</option></Select>
            </div>
            <Textarea name="keywords" placeholder="Mots-clés complémentaires" defaultValue="villa, ocean view, gestion saisonnière, superhost, conciergerie airbnb" />
            <Button className="w-full" size="lg" disabled={loading}>{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Radar className="h-4 w-4" />} Lancer la recherche intelligente</Button>
          </form>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader className="border-b border-white/10">
          <CardTitle className="flex items-center gap-2"><Brain className="h-5 w-5 text-primary" /> Recherche intelligente</CardTitle>
          <p className="text-sm text-muted-foreground">Simulation V1 : agrégation publique, déduplication, enrichissement, scoring et préparation commerciale.</p>
        </CardHeader>
        <CardContent className="pt-5">
          {loading ? (
            <div className="space-y-4">
              {['Recherche organique', 'Détection conciergeries locales', 'Enrichissement coordonnées publiques', 'Hidden Pain Detector', 'Scoring Concierge Fit'].map((step, index) => (
                <motion.div key={step} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.12 }} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <div className="flex items-center gap-3 text-sm text-white"><Sparkles className="h-4 w-4 text-primary" /> {step}</div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full w-2/3 animate-shimmer rounded-full bg-gradient-to-r from-transparent via-primary to-transparent" /></div>
                </motion.div>
              ))}
            </div>
          ) : results.length ? (
            <div className="space-y-3">
              {results.map((result) => (
                <div key={result.id} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="font-medium text-white">{result.title}</div>
                    <Badge variant="success">{result.estimatedProperties ?? 1} bien(s)</Badge>
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">{result.city} · {result.sourceName}</div>
                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">{result.snippet}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex min-h-[420px] flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/[0.025] p-8 text-center">
              <Radar className="mb-4 h-10 w-10 text-primary" />
              <div className="text-lg font-medium text-white">Prêt à lancer le radar</div>
              <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">Entre une ville, une cible et un niveau de recherche. Prospect créera une campagne et retournera des leads mockés réalistes.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
