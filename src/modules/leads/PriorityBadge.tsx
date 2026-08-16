import { Flame, Sun, Snowflake } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LeadPriority } from "@/types/enums";

// Icon + text alongside color so priority reads without relying on hue alone
// (color-blind users, grayscale printouts, etc.).
const PRIORITY_STYLES: Record<LeadPriority, { label: string; icon: typeof Flame; dot: string; text: string; bg: string }> = {
  hot: { label: "Hot", icon: Flame, dot: "bg-danger", text: "text-danger", bg: "bg-danger/10" },
  warm: { label: "Warm", icon: Sun, dot: "bg-warning", text: "text-warning", bg: "bg-warning/10" },
  cold: { label: "Cold", icon: Snowflake, dot: "bg-info", text: "text-info", bg: "bg-info/10" },
};

export function PriorityBadge({ priority, className }: { priority: LeadPriority; className?: string }) {
  const style = PRIORITY_STYLES[priority];
  const Icon = style.icon;
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium", style.bg, style.text, className)}>
      <Icon className="h-3 w-3" aria-hidden="true" />
      {style.label}
    </span>
  );
}
