import { useState, type KeyboardEvent } from "react";
import { useNavigate } from "react-router";
import { Loader2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { StaffNameCell } from "@/modules/users/StaffNameCell";
import { useComments, useCreateComment } from "./hooks";
import type { CommentEntityType } from "@/types/enums";
import { formatRelativeTime } from "@/utils/format";
import { cn } from "@/lib/utils";

const PREVIEW_COUNT = 5;

interface CommentBadgeProps {
  entityType: CommentEntityType;
  entityId: string;
  count: number;
  detailPath: string;
}

export function CommentBadge({ entityType, entityId, count, detailPath }: CommentBadgeProps) {
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState("");
  const navigate = useNavigate();
  const { data, isLoading } = useComments(entityType, entityId, { enabled: open });
  const createComment = useCreateComment(entityType, entityId);

  function submit() {
    const trimmed = body.trim();
    if (!trimmed) return;
    createComment.mutate(trimmed, { onSuccess: () => setBody("") });
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      submit();
    }
  }

  const recent = data ? data.items.slice(-PREVIEW_COUNT).reverse() : [];

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn("h-6 gap-1 px-1.5 text-xs", count > 0 ? "text-foreground hover:text-foreground" : "text-muted-foreground")}
            aria-label={count > 0 ? `${count} comment${count === 1 ? "" : "s"} — click to view or add` : "Add a comment"}
          >
            <MessageSquare className={cn("h-3.5 w-3.5", count > 0 && "fill-primary/15 text-primary")} aria-hidden="true" />
            {count > 0 && <span className="tabular-nums">{count}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-80" onClick={(e) => e.stopPropagation()}>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">Comments{count > 0 ? ` (${count})` : ""}</p>
              <button
                type="button"
                className="text-xs text-primary outline-none hover:underline focus-visible:underline"
                onClick={() => {
                  setOpen(false);
                  navigate(detailPath);
                }}
              >
                Open
              </button>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" aria-hidden="true" />
              </div>
            ) : recent.length > 0 ? (
              <div className="max-h-48 space-y-2.5 overflow-y-auto pr-1">
                {recent.map((c) => (
                  <div key={c.id} className="text-sm">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <StaffNameCell userId={c.author_id} />
                      <span aria-hidden="true">·</span>
                      <span>{formatRelativeTime(c.created_at)}</span>
                    </div>
                    <p className="mt-0.5 whitespace-pre-wrap break-words text-foreground">{c.body}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-1 text-sm text-muted-foreground">No comments yet.</p>
            )}

            <div className="space-y-1.5 border-t border-border pt-2.5">
              <Textarea
                rows={2}
                placeholder="Add a comment…"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                onKeyDown={onKeyDown}
              />
              <div className="flex justify-end">
                <Button size="sm" disabled={!body.trim() || createComment.isPending} onClick={submit}>
                  {createComment.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Comment
                </Button>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
