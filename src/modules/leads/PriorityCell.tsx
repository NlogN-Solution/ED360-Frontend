import { useState } from "react";
import { Check } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { PriorityBadge } from "./PriorityBadge";
import { useInlinePriority } from "./hooks";
import { LeadPriority } from "@/types/enums";
import { cn } from "@/lib/utils";

const OPTIONS = Object.values(LeadPriority);

export function PriorityCell({ leadId, value, editable }: { leadId: string; value: LeadPriority; editable: boolean }) {
  const [open, setOpen] = useState(false);
  const update = useInlinePriority(leadId);

  if (!editable) return <PriorityBadge priority={value} />;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          className="rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          aria-label={`Change priority, currently ${value}`}
        >
          <PriorityBadge priority={value} className="cursor-pointer transition-opacity hover:opacity-80" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-40 p-1" onClick={(e) => e.stopPropagation()}>
        {OPTIONS.map((p) => (
          <button
            key={p}
            type="button"
            disabled={p === value}
            onClick={() => {
              setOpen(false);
              if (p !== value) update.mutate(p);
            }}
            className={cn(
              "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm outline-none hover:bg-muted focus-visible:bg-muted disabled:cursor-default",
            )}
          >
            <PriorityBadge priority={p} />
            {p === value && <Check className="h-3.5 w-3.5 text-primary" aria-hidden="true" />}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}
