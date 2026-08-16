import { cn } from "@/lib/utils";
import { formatDate } from "@/utils/format";

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function FollowUpDateBadge({ value, className }: { value: string | null; className?: string }) {
  if (!value) {
    return <span className={cn("text-muted-foreground", className)}>—</span>;
  }

  const scheduled = new Date(value);
  const today = startOfDay(new Date());
  const tomorrow = new Date(today.getTime() + 86_400_000);

  const style =
    scheduled < today
      ? { label: "Overdue", text: "text-danger", bg: "bg-danger/10" }
      : scheduled < tomorrow
        ? { label: "Due today", text: "text-warning", bg: "bg-warning/10" }
        : null;

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <span className="text-muted-foreground">{formatDate(value)}</span>
      {style && (
        <span
          className={cn(
            "inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium",
            style.bg,
            style.text,
          )}
        >
          {style.label}
        </span>
      )}
    </div>
  );
}
