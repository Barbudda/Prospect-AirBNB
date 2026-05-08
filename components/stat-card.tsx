import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

export function StatCard({ label, value, detail, icon: Icon }: { label: string; value: string | number; detail: string; icon: LucideIcon }) {
  return (
    <Card className="relative overflow-hidden p-5">
      <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />
      <div className="flex items-center justify-between">
        <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-2.5 text-primary">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-5 text-3xl font-semibold tracking-tight text-white">{value}</div>
      <div className="mt-1 text-sm font-medium text-white/80">{label}</div>
      <div className="mt-2 text-xs leading-5 text-muted-foreground">{detail}</div>
    </Card>
  );
}
