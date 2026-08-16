import { useState } from "react";
import { Loader2, MessageSquare, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { StaffNameCell } from "@/modules/users/StaffNameCell";
import { useAuthStore } from "@/services/authStore";
import { isManagerRole } from "@/constants/permissions";
import { useComments, useCreateComment, useDeleteComment } from "./hooks";
import type { CommentEntityType } from "@/types/enums";
import { formatDateTime } from "@/utils/format";

interface CommentsPanelProps {
  entityType: CommentEntityType;
  entityId: string;
  /** Render as a bare list+composer (for embedding in a Tabs/section) — default true. */
  bare?: boolean;
}

export function CommentsPanel({ entityType, entityId, bare = true }: CommentsPanelProps) {
  const [body, setBody] = useState("");
  const currentUserId = useAuthStore((s) => s.user?.id);
  const role = useAuthStore((s) => s.user?.role);
  const { data, isLoading } = useComments(entityType, entityId);
  const createComment = useCreateComment(entityType, entityId);
  const deleteComment = useDeleteComment(entityType);

  function submit() {
    const trimmed = body.trim();
    if (!trimmed) return;
    createComment.mutate(trimmed, { onSuccess: () => setBody("") });
  }

  const content = (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Textarea
          rows={3}
          placeholder="Add a comment for your team… (not visible to the student)"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
              e.preventDefault();
              submit();
            }
          }}
        />
        <div className="flex justify-end">
          <Button size="sm" disabled={!body.trim() || createComment.isPending} onClick={submit}>
            {createComment.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Comment
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : !data || data.items.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No comments yet"
          description="Notes here are staff-only and never visible on the student portal."
          className="border-none py-10"
        />
      ) : (
        <div className="space-y-3">
          {[...data.items].reverse().map((c) => {
            const canDelete = c.author_id === currentUserId || isManagerRole(role);
            return (
              <div key={c.id} className="group/comment flex items-start justify-between gap-3 rounded-lg border border-border p-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">
                      <StaffNameCell userId={c.author_id} />
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{formatDateTime(c.created_at)}</span>
                  </div>
                  <p className="mt-1 whitespace-pre-wrap break-words text-sm text-foreground">{c.body}</p>
                </div>
                {canDelete && (
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    className="shrink-0 text-muted-foreground opacity-0 transition-opacity hover:text-danger group-hover/comment:opacity-100 focus-visible:opacity-100"
                    title="Delete comment"
                    aria-label="Delete comment"
                    disabled={deleteComment.isPending}
                    onClick={() => deleteComment.mutate(c.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  if (bare) return content;
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h2 className="mb-3 text-[13px] font-semibold text-foreground">Comments</h2>
      {content}
    </div>
  );
}
