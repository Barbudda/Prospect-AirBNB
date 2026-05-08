import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "muted" | "violet";

const variants: Record<BadgeVariant, string> = {
  default: "border-cyan-400/25 bg-cyan-400/10 text-cyan-200",
  success: "border-emerald-400/25 bg-emerald-400/10 text-emerald-200",
  warning: "border-amber-400/25 bg-amber-400/10 text-amber-200",
  danger: "border-rose-400/25 bg-rose-400/10 text-rose-200",
  muted: "border-white/10 bg-white/[0.06] text-muted-foreground",
  violet: "border-violet-400/25 bg-violet-400/10 text-violet-200",
};

export function Badge({ className, variant = "default", ...props }: React.HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  return <span className={cn("inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium", variants[variant], className)} {...props} />;
}
