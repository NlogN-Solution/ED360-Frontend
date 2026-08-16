import { useMemo, useState } from "react";
import { MessageCircle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/services/authStore";
import { useDebounce } from "@/hooks/useDebounce";
import { formatRelativeTime } from "@/utils/format";
import { cn } from "@/lib/utils";
import { useWhatsAppConversations } from "./hooks";

type Filter = "all" | "unread" | "mine" | "unassigned";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "unread", label: "Unread" },
  { value: "mine", label: "Assigned to me" },
  { value: "unassigned", label: "Unassigned" },
];

interface ConversationListProps {
  activeId: string | undefined;
  onSelect: (id: string) => void;
}

export function ConversationList({ activeId, onSelect }: ConversationListProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const debouncedSearch = useDebounce(search, 300);
  const currentUserId = useAuthStore((s) => s.user?.id);

  const params = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      assigned_to: filter === "mine" ? currentUserId : undefined,
      unassigned: filter === "unassigned",
      limit: 30,
    }),
    [debouncedSearch, filter, currentUserId],
  );

  const { data, isLoading } = useWhatsAppConversations(params);
  const items = (data?.items ?? []).filter((c) => (filter === "unread" ? c.unread_count > 0 : true));

  return (
    <div className="flex h-full flex-col">
      <div className="space-y-2 border-b border-border p-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search WhatsApp…"
            className="h-8 pl-8 text-xs"
          />
        </div>
        <div className="flex flex-wrap gap-1">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              className={cn(
                "rounded-md px-2 py-1 text-[11px] font-medium transition-colors",
                filter === f.value ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="space-y-2 p-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={MessageCircle}
            title="No conversations found"
            description="Try another name, phone number, or filter."
            className="border-none py-10"
          />
        ) : (
          items.map((conversation) => (
            <button
              type="button"
              key={conversation.id}
              onClick={() => onSelect(conversation.id)}
              className={cn(
                "flex w-full items-start gap-2 border-b border-border/60 px-3 py-2.5 text-left transition-colors last:border-none hover:bg-muted/50",
                activeId === conversation.id && "bg-muted",
              )}
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-foreground">
                  {conversation.contact.wa_profile_name || conversation.contact.phone_e164}
                </p>
                <p className="line-clamp-1 text-xs text-muted-foreground">
                  {conversation.last_message_preview ?? "No messages yet"}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <span className="text-[10px] text-muted-foreground">
                  {conversation.last_message_at ? formatRelativeTime(conversation.last_message_at) : ""}
                </span>
                {conversation.unread_count > 0 && (
                  <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground">
                    {conversation.unread_count > 9 ? "9+" : conversation.unread_count}
                  </span>
                )}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
