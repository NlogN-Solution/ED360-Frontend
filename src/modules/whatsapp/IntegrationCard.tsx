import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Check,
  Loader2,
  MessageCircle,
  MessagesSquare,
  ShieldCheck,
  BellRing,
  StickyNote,
  History,
  FileText,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatDateTime } from "@/utils/format";
import { useDisconnectWhatsApp, useWhatsAppIntegrationStatus } from "./hooks";
import { ConnectWhatsAppFlow } from "./ConnectWhatsAppFlow";
import { IntegrationStatus } from "@/types/enums";

const FEATURES = [
  { icon: MessagesSquare, label: "Send and receive WhatsApp messages" },
  { icon: History, label: "Student conversation history" },
  { icon: ShieldCheck, label: "Counsellor assignment" },
  { icon: Check, label: "Message delivery status" },
  { icon: FileText, label: "Document sharing" },
  { icon: StickyNote, label: "Message templates" },
  { icon: BellRing, label: "Automated notifications" },
  { icon: Clock, label: "Internal notes" },
];

export function WhatsAppIntegrationCard({ canManage }: { canManage: boolean }) {
  const navigate = useNavigate();
  const { data, isLoading } = useWhatsAppIntegrationStatus();
  const disconnect = useDisconnectWhatsApp();
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
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-success/10 text-success">
          <MessageCircle className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-[15px] font-semibold text-foreground">WhatsApp Business</h2>
          <p className="text-xs text-muted-foreground">Communicate with leads and students directly from Ignition.</p>
        </div>
      </div>

      {!isConnected ? (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Connect your organization's WhatsApp Business account to communicate with leads and students directly
            from Ignition.
          </p>
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {FEATURES.map((f) => (
              <li key={f.label} className="flex items-center gap-2 text-xs text-muted-foreground">
                <f.icon className="h-3.5 w-3.5 shrink-0 text-success" />
                {f.label}
              </li>
            ))}
          </ul>
          {integration?.status === IntegrationStatus.ERROR && integration.last_error && (
            <p className="rounded-lg bg-danger/10 px-3 py-2 text-xs text-danger">{integration.last_error}</p>
          )}
          {canManage ? (
            <Button size="sm" onClick={() => setConnectOpen(true)}>
              Connect WhatsApp Business
            </Button>
          ) : (
            <p className="text-xs text-muted-foreground">Ask an organization administrator to connect WhatsApp Business.</p>
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
              <dt className="text-xs text-muted-foreground">Phone</dt>
              <dd className="text-foreground">{account?.display_phone_number}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Business Account</dt>
              <dd className="font-mono text-xs text-foreground">{account?.whatsapp_business_account_id}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Connected</dt>
              <dd className="text-foreground">{integration?.connected_at ? formatDateTime(integration.connected_at) : "—"}</dd>
            </div>
          </dl>
          {integration?.last_error && (
            // The account is genuinely connected (verified sends work) but
            // something non-fatal is off — e.g. Embedded Signup connected
            // fine but Meta's inbound-webhook subscription call failed.
            <p className="rounded-lg bg-warning/10 px-3 py-2 text-xs text-warning">{integration.last_error}</p>
          )}
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => navigate("/communication?tab=whatsapp")}>
              Open WhatsApp
            </Button>
            {canManage && (
              <Button
                variant="outline"
                size="sm"
                className={cn("text-danger hover:text-danger")}
                disabled={disconnect.isPending}
                onClick={() => {
                  if (confirm("Disconnect WhatsApp Business? Existing conversations and messages are kept, and you can reconnect later.")) {
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

      <ConnectWhatsAppFlow open={connectOpen} onOpenChange={setConnectOpen} />
    </div>
  );
}
