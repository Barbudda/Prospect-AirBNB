"use client";

import { useState } from "react";
import { Loader2, ScanSearch } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type LocalScrapeResponse = {
  result?: { status: string; title?: string; error?: string; url: string };
  source?: { title: string; snippet: string; relevanceScore: number; credibilityScore: number; legalStatus: string };
  analysis?: { reusableCommercialValue: number; pain: { guestPainPoints: string[]; ownerPainPoints: string[]; intensity: number } } | null;
  error?: string;
};

export function LocalScrapeForm() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<LocalScrapeResponse | null>(null);

  async function submit(formData: FormData) {
    setLoading(true);
    setResponse(null);
    try {
      const url = String(formData.get("url") || "").trim();
      const maxDepth = Number(formData.get("maxDepth") || 1);
      if (!url) {
        setLoading(false);
        return;
      }
      const res = await fetch("/api/scanner/local-scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, maxDepth }),
      });
      const data = await res.json();
      setResponse(data);
    } catch (e) {
      setResponse({ error: e instanceof Error ? e.message : "Erreur réseau" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <form action={submit} className="space-y-3">
        <Input name="url" type="url" placeholder="https://example.com/page-publique" required />
        <Input name="maxDepth" type="number" min="1" max="2" defaultValue="1" />
        <Button className="w-full" disabled={loading}>{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ScanSearch className="h-4 w-4" />} Analyser via adaptateur local</Button>
      </form>
      {response ? <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
        {response.error ? <Badge variant="warning">Erreur: {response.error}</Badge> : <Badge variant={response.result?.status === "success" ? "success" : "warning"}>{response.result?.status ?? "unknown"}</Badge>}
        <div className="mt-3 font-medium text-white">{response.source?.title ?? response.result?.title ?? response.result?.url}</div>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{response.source?.snippet ?? response.result?.error}</p>
        {response.analysis ? <div className="mt-4 flex flex-wrap gap-2">
          <Badge variant="violet">value {response.analysis.reusableCommercialValue}</Badge>
          <Badge variant="warning">pain {response.analysis.pain.intensity}</Badge>
          {response.analysis.pain.guestPainPoints.slice(0, 3).map((pain) => <Badge key={pain} variant="muted">{pain}</Badge>)}
        </div> : null}
      </div> : null}
    </div>
  );
}
