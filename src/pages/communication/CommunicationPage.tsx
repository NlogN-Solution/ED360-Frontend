import { useState } from "react";
import { useSearchParams } from "react-router";
import { MessageSquare, Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { UserPicker } from "@/components/shared/UserPicker";
import { StaffPicker } from "@/modules/people/StaffPicker";
import { useConversations, useCreateConversation } from "@/modules/communication/hooks";
import { ConversationThread } from "@/modules/communication/ConversationThread";
import { WhatsAppInboxTab } from "@/modules/whatsapp/WhatsAppInboxTab";
import { EmailInboxTab } from "@/modules/email/EmailInboxTab";
import { CommunicationKind, UserRole } from "@/types/enums";
import { cn } from "@/lib/utils";

function ConversationList({ kind }: { kind: CommunicationKind }) {
  const { data, isLoading } = useConversations(kind);
  const createConversation = useCreateConversation();
  const [activeId, setActiveId] = useState<string | undefined>();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickedId, setPickedId] = useState<string | undefined>();

  const items = data?.items ?? [];
  const active = items.find((i) => i.id === activeId) ?? items[0];

  function handlePick(userId: string | undefined) {
    setPickedId(userId);
    if (!userId) return;
    createConversation.mutate(
      { kind, participant_id: userId },
      {
        onSuccess: (conversation) => {
          setActiveId(conversation.id);
          setPickerOpen(false);
          setPickedId(undefined);
        },
      },
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-[300px_1fr]">
      <div className="flex h-[560px] flex-col rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border p-3">
          <span className="text-sm font-medium">{kind === CommunicationKind.INTERNAL ? "Team" : "Students"}</span>
          <Button size="sm" variant="outline" className="h-7 px-2" onClick={() => setPickerOpen((v) => !v)}>
            <Plus className="h-3.5 w-3.5" /> New
          </Button>
        </div>
        {pickerOpen && (
          <div className="border-b border-border p-3">
            {kind === CommunicationKind.INTERNAL ? (
              <StaffPicker value={pickedId} onChange={handlePick} placeholder="Message a colleague…" />
            ) : (
              <UserPicker value={pickedId} onChange={handlePick} role={UserRole.STUDENT} placeholder="Message a student…" />
            )}
          </div>
        )}
        <div className="min-h-0 flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-sm text-muted-foreground">Loading…</div>
          ) : items.length === 0 ? (
            <EmptyState
              icon={MessageSquare}
              title="No conversations yet"
              description="Start one with the New button above."
              className="border-none py-10"
            />
          ) : (
            items.map((item) => (
              <button
                type="button"
                key={item.id}
                onClick={() => setActiveId(item.id)}
                className={cn(
                  "flex w-full items-start gap-2 border-b border-border/60 px-3 py-2.5 text-left transition-colors last:border-none hover:bg-muted/50",
                  active?.id === item.id && "bg-muted",
                )}
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-foreground">{item.display_name}</p>
                  <p className="line-clamp-1 text-xs text-muted-foreground">
                    {item.last_message_preview ?? "No messages yet"}
                  </p>
                </div>
                {item.unread_count > 0 && (
                  <span className="mt-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground">
                    {item.unread_count > 9 ? "9+" : item.unread_count}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      <div className="h-[560px] rounded-xl border border-border bg-card">
        {active ? (
          <ConversationThread conversationId={active.id} className="h-full" />
        ) : (
          <EmptyState
            icon={MessageSquare}
            title="Select a conversation"
            description="Pick a conversation on the left, or start a new one."
            className="flex h-full flex-col items-center justify-center border-none"
          />
        )}
      </div>
    </div>
  );
}

export function CommunicationPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") ?? "crm-message";

  return (
    <div>
      <PageHeader title="Communication" description="Message your team and students, right from the CRM." />

      <Tabs value={activeTab} onValueChange={(v) => setSearchParams((prev) => ({ ...Object.fromEntries(prev), tab: v }))}>
        <TabsList>
          <TabsTrigger value="crm-message">CRM Message</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
        </TabsList>

        <TabsContent value="crm-message" className="mt-4">
          <Tabs defaultValue="internal">
            <TabsList>
              <TabsTrigger value="internal">Internal</TabsTrigger>
              <TabsTrigger value="student">Student</TabsTrigger>
            </TabsList>
            <TabsContent value="internal" className="mt-4">
              <ConversationList kind={CommunicationKind.INTERNAL} />
            </TabsContent>
            <TabsContent value="student" className="mt-4">
              <ConversationList kind={CommunicationKind.STUDENT} />
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="email" className="mt-4">
          <EmailInboxTab />
        </TabsContent>
        <TabsContent value="whatsapp" className="mt-4">
          <WhatsAppInboxTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
