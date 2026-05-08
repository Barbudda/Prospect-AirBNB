import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const stages = [
  { label: "Nouveau", value: 7 },
  { label: "Qualifié", value: 5 },
  { label: "À contacter", value: 4 },
  { label: "Contacté", value: 2 },
  { label: "Démo", value: 1 },
  { label: "Converti", value: 0 },
];

export function PipelineChart() {
  const max = Math.max(...stages.map((stage) => stage.value));
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pipeline commercial</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex h-52 items-end gap-3">
          {stages.map((stage) => (
            <div key={stage.label} className="flex flex-1 flex-col items-center gap-2">
              <div className="flex w-full items-end rounded-t-2xl bg-white/[0.04]">
                <div className="w-full rounded-t-2xl bg-gradient-to-t from-emerald-400/80 to-violet-400/80" style={{ height: `${Math.max(12, (stage.value / max) * 160)}px` }} />
              </div>
              <div className="text-center text-[11px] text-muted-foreground">{stage.label}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
