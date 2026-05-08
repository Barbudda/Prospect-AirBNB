"use client";

import { useMemo, useState } from "react";
import { GripVertical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScoreRing } from "@/components/score-ring";
import type { CrmStatus, Prospect } from "@/lib/types";

const columns: { id: CrmStatus; label: string }[] = [
  { id: "new", label: "Nouveau" },
  { id: "to_enrich", label: "À enrichir" },
  { id: "qualified", label: "Qualifié" },
  { id: "to_contact", label: "À contacter" },
  { id: "contacted", label: "Contacté" },
  { id: "replied", label: "Répondu" },
  { id: "demo_scheduled", label: "Démo prévue" },
  { id: "converted", label: "Converti" },
  { id: "lost", label: "Perdu" },
];

export function CrmBoard({ prospects }: { prospects: Prospect[] }) {
  const [items, setItems] = useState(prospects);
  const grouped = useMemo(() => columns.map((column) => ({ ...column, prospects: items.filter((item) => item.status === column.id) })), [items]);

  function moveProspect(id: string, status: CrmStatus) {
    setItems((current) => current.map((prospect) => prospect.id === id ? { ...prospect, status } : prospect));
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {grouped.map((column) => (
        <div key={column.id} onDragOver={(event) => event.preventDefault()} onDrop={(event) => moveProspect(event.dataTransfer.getData("prospectId"), column.id)} className="min-h-[620px] w-80 shrink-0 rounded-3xl border border-white/10 bg-white/[0.035] p-3">
          <div className="mb-3 flex items-center justify-between px-2">
            <div className="font-medium text-white">{column.label}</div>
            <Badge variant="muted">{column.prospects.length}</Badge>
          </div>
          <div className="space-y-3">
            {column.prospects.map((prospect) => (
              <div key={prospect.id} draggable onDragStart={(event) => event.dataTransfer.setData("prospectId", prospect.id)} className="cursor-grab rounded-2xl border border-white/10 bg-slate-950/70 p-4 shadow-lg transition hover:border-primary/40">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <div className="font-medium text-white">{prospect.companyName || prospect.name}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{prospect.city} · {prospect.estimatedProperties} bien(s)</div>
                  </div>
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="mb-3 flex items-center justify-between">
                  <ScoreRing score={prospect.globalScore} size="sm" />
                  <Badge variant={prospect.globalScore >= 84 ? "success" : "warning"}>{prospect.status}</Badge>
                </div>
                <p className="line-clamp-2 text-xs leading-5 text-muted-foreground">{prospect.outreachAngle}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
