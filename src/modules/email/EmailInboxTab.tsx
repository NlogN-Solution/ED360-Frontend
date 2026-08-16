import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import { Lock, Mail, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/services/authStore";
import { isManagerRole } from "@/constants/permissions";
import { IntegrationStatus } from "@/types/enums";
import { useEmailIntegrationStatus, useEmailThreads } from "./hooks";
import { ThreadList } from "./ThreadList";
import { ThreadView } from "./ThreadView";
import { ComposeEmailDialog } from "./ComposeEmailDialog";

export function EmailInboxTab() {
  const role = useAuthStore((s) => s.user?.role);
  const canConnect = isManagerRole(role);
  const { data: status, isLoading } = useEmailIntegrationStatus();
  const [searchParams] = useSearchParams();
  const [activeId, setActiveId] = useState<string | undefined>(searchParams.get("thread") ?? undefined);
  const [composeOpen, setComposeOpen] = useState(false);

  const isConnected = status?.integration?.status === IntegrationStatus.CONNECTED;

  const { data: threads } = useEmailThreads({ limit: 30 }, { enabled: isConnected });
  const active = threads?.items.find((t) => t.id === activeId);

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
        title="Email is not connected"
        description={
          canConnect
            ? "Connect your organization's email from Integrations to start messaging leads and students here."
            : "Ask an organization administrator to connect email."
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
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button size="sm" className="h-7 gap-1.5 text-xs" onClick={() => setComposeOpen(true)}>
          <Plus className="h-3.5 w-3.5" /> Compose
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-[300px_1fr]">
        <div className="h-[560px] rounded-xl border border-border bg-card">
          <ThreadList activeId={activeId} onSelect={setActiveId} />
        </div>
        <div className="h-[560px] rounded-xl border border-border bg-card">
          {active ? (
            <ThreadView thread={active} />
          ) : (
            <EmptyState
              icon={Mail}
              title="Select a thread"
              description="Pick a thread on the left to see the full conversation and student context."
              className="flex h-full flex-col items-center justify-center border-none"
            />
          )}
        </div>
      </div>
      <ComposeEmailDialog open={composeOpen} onOpenChange={setComposeOpen} />
    </div>
  );
}
