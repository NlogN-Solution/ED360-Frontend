import { useEffect } from "react";
import { useNavigate } from "react-router";
import { AlertTriangle, Check, CheckCheck, Clock, ExternalLink, FileText } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { CommentsPanel } from "@/modules/comments/CommentsPanel";
import { CommentEntityType, WhatsAppContactEntityType, WhatsAppMessageDirection, WhatsAppMessageStatus } from "@/types/enums";
import { formatDateTime } from "@/utils/format";
import { cn } from "@/lib/utils";
import { useMarkWhatsAppConversationRead, useWhatsAppMessages } from "./hooks";
import { AssignConversationCell } from "./AssignConversationCell";
import { MessageComposer } from "./MessageComposer";
import type { WhatsAppConversationRead, WhatsAppMessageRead } from "./types";

const STATUS_ICON: Record<string, typeof Check> = {
  [WhatsAppMessageStatus.PENDING]: Clock,
  [WhatsAppMessageStatus.SENT]: Check,
  [WhatsAppMessageStatus.DELIVERED]: CheckCheck,
  [WhatsAppMessageStatus.READ]: CheckCheck,
  [WhatsAppMessageStatus.FAILED]: AlertTriangle,
};

const STATUS_LABEL: Record<string, string> = {
  [WhatsAppMessageStatus.PENDING]: "Sending…",
  [WhatsAppMessageStatus.SENT]: "Sent",
  [WhatsAppMessageStatus.DELIVERED]: "Delivered",
  [WhatsAppMessageStatus.READ]: "Read",
  [WhatsAppMessageStatus.FAILED]: "Failed",
};

function MessageBubble({ message }: { message: WhatsAppMessageRead }) {
  const isOutbound = message.direction === WhatsAppMessageDirection.OUTBOUND;
  const StatusIcon = message.status ? STATUS_ICON[message.status] : null;

  return (
    <div className={cn("flex", isOutbound ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[75%] rounded-xl px-3 py-2 text-sm",
          isOutbound ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
          message.status === WhatsAppMessageStatus.FAILED && "border border-danger",
        )}
      >
        {message.message_type === "template" && (
          <p className={cn("mb-1 text-[10px] font-medium uppercase tracking-wide", isOutbound ? "text-primary-foreground/70" : "text-muted-foreground")}>
            Template: {message.template_name}
          </p>
        )}
        {message.media_url && (
          <a
            href={message.media_url}
            target="_blank"
            rel="noreferrer"
            className={cn(
              "mb-1 flex items-center gap-1.5 rounded-md px-1.5 py-1 text-xs underline underline-offset-2",
              isOutbound ? "text-primary-foreground" : "text-foreground",
            )}
          >
            <FileText className="h-3.5 w-3.5 shrink-0" /> Attachment
          </a>
        )}
        {message.body && <p className="whitespace-pre-wrap break-words">{message.body}</p>}
        <div
          className={cn(
            "mt-1 flex items-center gap-1 text-[10px]",
            isOutbound ? "text-primary-foreground/70" : "text-muted-foreground",
          )}
        >
          <span>{formatDateTime(message.created_at)}</span>
          {isOutbound && StatusIcon && (
            <span className="flex items-center gap-0.5" title={message.error_message ?? STATUS_LABEL[message.status ?? ""]}>
              <StatusIcon className="h-3 w-3" aria-hidden="true" />
            </span>
          )}
        </div>
        {message.status === WhatsAppMessageStatus.FAILED && message.error_message && (
          <p className="mt-1 text-[10px] text-danger">{message.error_message}</p>
        )}
      </div>
    </div>
  );
}

export function ConversationView({ conversation }: { conversation: WhatsAppConversationRead }) {
  const navigate = useNavigate();
  const { data, isLoading } = useWhatsAppMessages(conversation.id);
  const markRead = useMarkWhatsAppConversationRead();

  useEffect(() => {
    if (conversation.unread_count > 0) markRead.mutate(conversation.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation.id]);

  const contactLabel = conversation.contact.wa_profile_name || conversation.contact.phone_e164;
  const matchedPath =
    conversation.contact.matched_entity_type === WhatsAppContactEntityType.LEAD
      ? `/leads/${conversation.contact.matched_entity_id}`
      : conversation.contact.matched_entity_type === WhatsAppContactEntityType.STUDENT
        ? `/applicants/${conversation.contact.matched_entity_id}`
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
          <p className="text-xs text-muted-foreground">{conversation.contact.phone_e164}</p>
        </div>
        <AssignConversationCell conversationId={conversation.id} assignedTo={conversation.assigned_to} />
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
            description="Messages with this contact will appear here."
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

      <MessageComposer conversation={conversation} />

      <details className="border-t border-border">
        <summary className="cursor-pointer px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground">
          🔒 Internal notes — never sent to WhatsApp
        </summary>
        <div className="max-h-64 overflow-y-auto p-3 pt-0">
          <CommentsPanel entityType={CommentEntityType.WHATSAPP_CONVERSATION} entityId={conversation.id} />
        </div>
      </details>
    </div>
  );
}
