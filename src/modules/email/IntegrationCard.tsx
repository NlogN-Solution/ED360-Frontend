import { useState } from "react";
import { useNavigate } from "react-router";
import { Check, Loader2, Mail, MessagesSquare, Paperclip, History, StickyNote, BellRing } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatDateTime } from "@/utils/format";
import { useDisconnectEmail, useEmailIntegrationStatus } from "./hooks";
import { ConnectEmailFlow } from "./ConnectEmailFlow";
import { IntegrationStatus } from "@/types/enums";

const FEATURES = [
  { icon: MessagesSquare, label: "Send and receive email" },
  { icon: History, label: "Student conversation history" },
  { icon: Check, label: "Counsellor assignment" },
  { icon: Paperclip, label: "File attachments" },
  { icon: StickyNote, label: "Internal notes" },
  { icon: BellRing, label: "New message notifications" },
];

export function EmailIntegrationCard({ canManage }: { canManage: boolean }) {
  const navigate = useNavigate();
  const { data, isLoading } = useEmailIntegrationStatus();
  const disconnect = useDisconnectEmail();
  const [connectOpen, setConnectOpen] = useState(false);

  const integration = data?.integration;
  const account = data?.account;
  const isConnected = integration?.status === IntegrationStatus.CONNECTED;

  if (isLoading) {
    return <div className="h-64 animate-pulse rounded-xl border border-border bg-card" />;
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Mail className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-[15px] font-semibold text-foreground">Email</h2>
          <p className="text-xs text-muted-foreground">Communicate with leads and students directly from Ignition.</p>
        </div>
      </div>

      {!isConnected ? (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Connect your organization's Gmail inbox to send and track email conversations with leads and students.
          </p>
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {FEATURES.map((f) => (
              <li key={f.label} className="flex items-center gap-2 text-xs text-muted-foreground">
                <f.icon className="h-3.5 w-3.5 shrink-0 text-primary" />
                {f.label}
              </li>
            ))}
          </ul>
          {integration?.status === IntegrationStatus.ERROR && integration.last_error && (
            <p className="rounded-lg bg-danger/10 px-3 py-2 text-xs text-danger">{integration.last_error}</p>
          )}
          {canManage ? (
            <Button size="sm" onClick={() => setConnectOpen(true)}>
              Connect email
            </Button>
          ) : (
            <p className="text-xs text-muted-foreground">Ask an organization administrator to connect email.</p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-xs font-medium text-success">
              <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden="true" />
              Connected
            </span>
          </div>
          <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs text-muted-foreground">Address</dt>
              <dd className="truncate text-foreground">{account?.email_address}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Last synced</dt>
              <dd className="text-foreground">
                {account?.last_synced_at ? formatDateTime(account.last_synced_at) : "Not yet synced"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Connected</dt>
              <dd className="text-foreground">{integration?.connected_at ? formatDateTime(integration.connected_at) : "—"}</dd>
            </div>
          </dl>
          {integration?.last_error && (
            <p className="rounded-lg bg-warning/10 px-3 py-2 text-xs text-warning">{integration.last_error}</p>
          )}
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => navigate("/communication?tab=email")}>
              Open Email
            </Button>
            {canManage && (
              <Button
                variant="outline"
                size="sm"
                className={cn("text-danger hover:text-danger")}
                disabled={disconnect.isPending}
                onClick={() => {
                  if (confirm("Disconnect email? Existing threads and messages are kept, and you can reconnect later.")) {
                    disconnect.mutate();
                  }
                }}
              >
                {disconnect.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Disconnect
              </Button>
            )}
          </div>
        </div>
      )}

      <ConnectEmailFlow open={connectOpen} onOpenChange={setConnectOpen} />
    </div>
  );
}
