import { useEffect } from "react";
import { useNavigate } from "react-router";
import { AlertTriangle, Check, Clock, ExternalLink, Paperclip } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { CommentsPanel } from "@/modules/comments/CommentsPanel";
import { CommentEntityType, EmailContactEntityType, EmailMessageDirection, EmailMessageStatus } from "@/types/enums";
import { formatDateTime } from "@/utils/format";
import { cn } from "@/lib/utils";
import { useMarkEmailThreadRead, useEmailMessages } from "./hooks";
import { AssignThreadCell } from "./AssignThreadCell";
import { MessageComposer } from "./MessageComposer";
import type { EmailMessageRead, EmailThreadRead } from "./types";

function MessageBubble({ message }: { message: EmailMessageRead }) {
  const isOutbound = message.direction === EmailMessageDirection.OUTBOUND;

  return (
    <div className={cn("flex", isOutbound ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[80%] rounded-xl px-3 py-2 text-sm",
          isOutbound ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
          message.status === EmailMessageStatus.FAILED && "border border-danger",
        )}
      >
        <p className={cn("mb-1 text-[10px]", isOutbound ? "text-primary-foreground/70" : "text-muted-foreground")}>
          {isOutbound ? `To: ${message.to_addresses.join(", ")}` : `From: ${message.from_address}`}
        </p>
        {message.body_text && <p className="whitespace-pre-wrap break-words">{message.body_text}</p>}
        {message.attachments.length > 0 && (
          <div className="mt-1.5 space-y-1">
            {message.attachments.map((attachment) =>
              attachment.local_url ? (
                <a
                  key={attachment.id}
                  href={attachment.local_url}
                  target="_blank"
                  rel="noreferrer"
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-1.5 py-1 text-xs underline underline-offset-2",
                    isOutbound ? "text-primary-foreground" : "text-foreground",
                  )}
                >
                  <Paperclip className="h-3.5 w-3.5 shrink-0" /> {attachment.filename}
                </a>
              ) : (
                <span key={attachment.id} className="flex items-center gap-1.5 px-1.5 py-1 text-xs opacity-70">
                  <Paperclip className="h-3.5 w-3.5 shrink-0" /> {attachment.filename} (unavailable)
                </span>
              ),
            )}
          </div>
        )}
        <div
          className={cn(
            "mt-1 flex items-center gap-1 text-[10px]",
            isOutbound ? "text-primary-foreground/70" : "text-muted-foreground",
          )}
        >
          <span>{formatDateTime(message.created_at)}</span>
          {isOutbound && message.status && (
            <span className="flex items-center gap-0.5" title={message.error_message ?? message.status}>
              {message.status === EmailMessageStatus.FAILED ? (
                <AlertTriangle className="h-3 w-3" aria-hidden="true" />
              ) : message.status === EmailMessageStatus.PENDING ? (
                <Clock className="h-3 w-3" aria-hidden="true" />
              ) : (
                <Check className="h-3 w-3" aria-hidden="true" />
              )}
            </span>
          )}
        </div>
        {message.status === EmailMessageStatus.FAILED && message.error_message && (
          <p className="mt-1 text-[10px] text-danger">{message.error_message}</p>
        )}
      </div>
    </div>
  );
}

export function ThreadView({ thread }: { thread: EmailThreadRead }) {
  const navigate = useNavigate();
  const { data, isLoading } = useEmailMessages(thread.id);
  const markRead = useMarkEmailThreadRead();

  useEffect(() => {
    if (thread.unread_count > 0) markRead.mutate(thread.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thread.id]);

  const contactLabel = thread.contact.display_name || thread.contact.email_address;
  const matchedPath =
    thread.contact.matched_entity_type === EmailContactEntityType.LEAD
      ? `/leads/${thread.contact.matched_entity_id}`
      : thread.contact.matched_entity_type === EmailContactEntityType.STUDENT
        ? `/applicants/${thread.contact.matched_entity_id}`
        : null;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border p-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-medium text-foreground">{contactLabel}</p>
            {matchedPath && (
              <button
                type="button"
                className="flex items-center gap-1 text-xs text-primary hover:underline"
                onClick={() => navigate(matchedPath)}
              >
                View profile <ExternalLink className="h-3 w-3" />
              </button>
            )}
          </div>
          <p className="truncate text-xs text-muted-foreground">{thread.subject || "(no subject)"}</p>
        </div>
        <AssignThreadCell threadId={thread.id} assignedTo={thread.assigned_to} />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-2/3" />
            ))}
          </div>
        ) : !data || data.items.length === 0 ? (
          <EmptyState
            icon={Clock}
            title="No messages yet"
            description="Messages in this thread will appear here."
            className="border-none py-10"
          />
        ) : (
          <div className="space-y-2">
            {data.items.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
          </div>
        )}
      </div>

      <MessageComposer thread={thread} />

      <details className="border-t border-border">
        <summary className="cursor-pointer px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground">
          🔒 Internal notes — never sent by email
        </summary>
        <div className="max-h-64 overflow-y-auto p-3 pt-0">
          <CommentsPanel entityType={CommentEntityType.EMAIL_THREAD} entityId={thread.id} />
        </div>
      </details>
    </div>
  );
}
