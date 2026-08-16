import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import { Lock, MessageCircle } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/services/authStore";
import { isManagerRole } from "@/constants/permissions";
import { IntegrationStatus } from "@/types/enums";
import { useWhatsAppIntegrationStatus, useWhatsAppConversations } from "./hooks";
import { ConversationList } from "./ConversationList";
import { ConversationView } from "./ConversationView";

export function WhatsAppInboxTab() {
  const role = useAuthStore((s) => s.user?.role);
  const canConnect = isManagerRole(role);
  const { data: status, isLoading } = useWhatsAppIntegrationStatus();
  const [searchParams] = useSearchParams();
  // Supports deep-linking from a "New WhatsApp message" notification
  // (?conversation=<id>) straight into the right thread.
  const [activeId, setActiveId] = useState<string | undefined>(searchParams.get("conversation") ?? undefined);

  const isConnected = status?.integration?.status === IntegrationStatus.CONNECTED;

  // Only fetch the active conversation's full row once we're actually
  // connected — avoids an unnecessary request while the not-connected empty
  // state is showing.
  const { data: conversations } = useWhatsAppConversations({ limit: 30 }, { enabled: isConnected });
  const active = conversations?.items.find((c) => c.id === activeId);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-[300px_1fr]">
        <Skeleton className="h-[560px]" />
        <Skeleton className="h-[560px]" />
      </div>
    );
  }

  if (!isConnected) {
    return (
      <EmptyState
        icon={Lock}
        title="WhatsApp is not connected"
        description={
          canConnect
            ? "Connect your organization's WhatsApp Business account from Integrations to start messaging leads and students here."
            : "Ask an organization administrator to connect WhatsApp Business."
        }
        className="border-none py-16"
        action={
          canConnect ? (
            <Link to="/integrations" className="text-sm font-medium text-primary hover:underline">
              Go to Integrations
            </Link>
          ) : undefined
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-[300px_1fr]">
      <div className="h-[560px] rounded-xl border border-border bg-card">
        <ConversationList activeId={activeId} onSelect={setActiveId} />
      </div>
      <div className="h-[560px] rounded-xl border border-border bg-card">
        {active ? (
          <ConversationView conversation={active} />
        ) : (
          <EmptyState
            icon={MessageCircle}
            title="Select a conversation"
            description="Pick a conversation on the left to see the full thread and student context."
            className="flex h-full flex-col items-center justify-center border-none"
          />
        )}
      </div>
    </div>
  );
}
