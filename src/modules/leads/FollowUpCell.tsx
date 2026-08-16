import { useState, type KeyboardEvent } from "react";
import { AlertTriangle, CalendarClock, Clock, Loader2, MessageSquarePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useQuickFollowUp } from "./hooks";
import { NEXT_FOLLOW_UP_GAP_DAYS } from "./types";
import type { LeadPriority } from "@/types/enums";
import { formatDate } from "@/utils/format";
import { cn } from "@/lib/utils";

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function followUpState(value: string | null) {
  if (!value) {
    return { label: "No follow-up scheduled", tone: "neutral" as const, Icon: Clock };
  }
  const scheduled = new Date(value);
  const today = startOfDay(new Date());
  const tomorrow = new Date(today.getTime() + 86_400_000);

  if (scheduled < today) return { label: `Overdue · ${formatDate(value)}`, tone: "danger" as const, Icon: AlertTriangle };
  if (scheduled < tomorrow) return { label: "Due today", tone: "warning" as const, Icon: Clock };
  return { label: formatDate(value), tone: "neutral" as const, Icon: CalendarClock };
}

const TONE_TEXT: Record<string, string> = {
  neutral: "text-muted-foreground",
  warning: "text-warning",
  danger: "text-danger",
};

interface FollowUpCellProps {
  leadId: string;
  nextFollowUpAt: string | null;
  priority: LeadPriority;
  editable: boolean;
  disabledReason?: string;
}

export function FollowUpCell({ leadId, nextFollowUpAt, priority, editable, disabledReason }: FollowUpCellProps) {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [completed, setCompleted] = useState(true);
  const quickFollowUp = useQuickFollowUp(leadId);
  const state = followUpState(nextFollowUpAt);

  function reset() {
    setNotes("");
    setCompleted(true);
  }

  function submit() {
    const trimmed = notes.trim();
    if (!trimmed) return;
    quickFollowUp.mutate(
      { notes: trimmed, completed, priority },
      {
        onSuccess: () => {
          setOpen(false);
          reset();
        },
      },
    );
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      submit();
    }
  }

  return (
    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
      <span className={cn("inline-flex min-w-0 items-center gap-1.5 text-xs", TONE_TEXT[state.tone])}>
        <state.Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span className="truncate">{state.label}</span>
      </span>

      {editable && (
        <Popover
          open={open}
          onOpenChange={(v) => {
            setOpen(v);
            if (!v) reset();
          }}
        >
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon-xs"
              disabled={Boolean(disabledReason)}
              title={disabledReason ?? "Add follow-up"}
              aria-label="Add follow-up"
              className="shrink-0 text-muted-foreground hover:text-foreground"
            >
              <MessageSquarePlus className="h-3.5 w-3.5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-80" onClick={(e) => e.stopPropagation()}>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor={`followup-notes-${leadId}`}>What happened?</Label>
                <Textarea
                  id={`followup-notes-${leadId}`}
                  autoFocus
                  rows={3}
                  placeholder="e.g. Called, interested in Australia intake, will send documents by Friday"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  onKeyDown={onKeyDown}
                />
              </div>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
                <Checkbox checked={completed} onCheckedChange={(v) => setCompleted(!!v)} />
                Follow-up completed
              </label>
              <p className="text-[11px] text-muted-foreground">
                {completed
                  ? "No further reminder — this closes out the follow-up."
                  : `We'll flag this lead again in ${NEXT_FOLLOW_UP_GAP_DAYS[priority]} day${NEXT_FOLLOW_UP_GAP_DAYS[priority] === 1 ? "" : "s"}.`}
              </p>
              <div className="flex justify-end gap-2 pt-1">
                <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button size="sm" disabled={!notes.trim() || quickFollowUp.isPending} onClick={submit}>
                  {quickFollowUp.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Submit Follow-up
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
