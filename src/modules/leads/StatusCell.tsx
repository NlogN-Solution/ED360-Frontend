import { useState } from "react";
import { ArrowRightCircle, Check, ShieldCheck, XCircle } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useInlineStatus, useQualifyLead } from "./hooks";
import type { LeadRead } from "./types";
import { LeadStatus } from "@/types/enums";
import { toTitleCase } from "@/utils/format";
import { cn } from "@/lib/utils";

const RAW_STATUSES = [LeadStatus.NEW, LeadStatus.CONTACTED, LeadStatus.FOLLOW_UP] as const;

interface StatusCellProps {
  lead: LeadRead;
  editable: boolean;
  onRequestMarkLost: (lead: LeadRead) => void;
  onRequestConvert: (lead: LeadRead) => void;
}

export function StatusCell({ lead, editable, onRequestMarkLost, onRequestConvert }: StatusCellProps) {
  const [open, setOpen] = useState(false);
  const changeStatus = useInlineStatus(lead.id);
  const qualifyLead = useQualifyLead(lead.id);

  const isTerminal = lead.status === LeadStatus.LOST || lead.status === LeadStatus.CONVERTED;
  const isRaw = (RAW_STATUSES as readonly string[]).includes(lead.status);

  if (!editable || isTerminal) {
    return <StatusBadge status={lead.status} />;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          className="rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          aria-label={`Change status, currently ${lead.status}`}
        >
          <StatusBadge status={lead.status} className="cursor-pointer transition-opacity hover:opacity-80" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-56 p-1" onClick={(e) => e.stopPropagation()}>
        {isRaw && (
          <>
            <p className="px-2 pb-1 pt-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Move to</p>
            {RAW_STATUSES.map((s) => (
              <StatusOption
                key={s}
                label={toTitleCase(s)}
                active={s === lead.status}
                onSelect={() => {
                  setOpen(false);
                  changeStatus.mutate(s);
                }}
              />
            ))}
            <div className="my-1 h-px bg-border" />
            <StatusOption
              label="Qualify → Prospect"
              icon={ShieldCheck}
              onSelect={() => {
                setOpen(false);
                qualifyLead.mutate(undefined);
              }}
            />
          </>
        )}
        {lead.status === LeadStatus.QUALIFIED && (
          <StatusOption
            label="Convert to client"
            icon={ArrowRightCircle}
            onSelect={() => {
              setOpen(false);
              onRequestConvert(lead);
            }}
          />
        )}
        <StatusOption
          label="Mark lost"
          icon={XCircle}
          tone="danger"
          onSelect={() => {
            setOpen(false);
            onRequestMarkLost(lead);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

function StatusOption({
  label,
  icon: Icon,
  active,
  tone,
  onSelect,
}: {
  label: string;
  icon?: typeof ShieldCheck;
  active?: boolean;
  tone?: "danger";
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      disabled={active}
      onClick={onSelect}
      className={cn(
        "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm outline-none hover:bg-muted focus-visible:bg-muted disabled:cursor-default disabled:opacity-50",
        tone === "danger" && "text-danger hover:bg-danger/10 focus-visible:bg-danger/10",
      )}
    >
      {Icon && <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />}
      <span className="flex-1">{label}</span>
      {active && <Check className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />}
    </button>
  );
}
