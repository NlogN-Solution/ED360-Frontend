import { useEffect, useRef, useState } from "react";
import { Loader2, MessageSquare, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EmptyState } from "@/components/shared/EmptyState";
import { useAuthStore } from "@/services/authStore";
import { formatRelativeTime } from "@/utils/format";
import { cn } from "@/lib/utils";
import { useMarkConversationRead, useMessages, useSendMessage } from "./hooks";

interface ConversationThreadProps {
  conversationId: string;
  className?: string;
}

export function ConversationThread({ conversationId, className }: ConversationThreadProps) {
  const currentUserId = useAuthStore((s) => s.user?.id);
  const { data, isLoading } = useMessages(conversationId, { limit: 100 });
  const sendMessage = useSendMessage(conversationId);
  const markRead = useMarkConversationRead();
  const [body, setBody] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    markRead.mutate(conversationId);
    // Re-run whenever the thread changes or new messages arrive, so opening/staying
    // on a thread keeps clearing its unread badge.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, data?.items.length]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [data?.items.length]);

  function handleSend() {
    const trimmed = body.trim();
    if (!trimmed) return;
    sendMessage.mutate({ body: trimmed }, { onSuccess: () => setBody("") });
  }

  return (
    <div className={cn("flex h-full min-h-0 flex-col", className)}>
      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col gap-3 p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : !data || data.items.length === 0 ? (
            <EmptyState
              icon={MessageSquare}
              title="No messages yet"
              description="Send the first message to start this conversation."
              className="border-none py-14"
            />
          ) : (
            data.items.map((message) => {
              const isMine = message.sender_id === currentUserId;
              return (
                <div key={message.id} className={cn("flex", isMine ? "justify-end" : "justify-start")}>
                  <div
                    className={cn(
                      "max-w-[75%] rounded-2xl px-3.5 py-2 text-sm",
                      isMine ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
                    )}
                  >
                    <p className="whitespace-pre-wrap break-words">{message.body}</p>
                    <p
                      className={cn(
                        "mt-1 text-[10px]",
                        isMine ? "text-primary-foreground/70" : "text-muted-foreground",
                      )}
                    >
                      {formatRelativeTime(message.created_at)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      <div className="flex items-end gap-2 border-t border-border p-3">
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Write a message…"
          rows={1}
          className="min-h-9 resize-none"
        />
        <Button size="icon" className="h-9 w-9 shrink-0" disabled={!body.trim() || sendMessage.isPending} onClick={handleSend}>
          {sendMessage.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
