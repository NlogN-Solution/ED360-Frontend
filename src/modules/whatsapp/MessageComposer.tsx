import { useRef, useState, type KeyboardEvent } from "react";
import { Clock, FileText, Loader2, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSendWhatsAppMedia, useSendWhatsAppMessage } from "./hooks";
import { TemplatePicker } from "./TemplatePicker";
import type { WhatsAppConversationRead, WhatsAppTemplateRead } from "./types";

export function MessageComposer({ conversation }: { conversation: WhatsAppConversationRead }) {
  const [body, setBody] = useState("");
  const [mode, setMode] = useState<"text" | "template">("text");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sendMessage = useSendWhatsAppMessage(conversation.id);
  const sendMedia = useSendWhatsAppMedia(conversation.id);

  const windowOpen = Boolean(conversation.window_expires_at) && new Date(conversation.window_expires_at as string) > new Date();

  function submitText() {
    const trimmed = body.trim();
    if (!trimmed) return;
    sendMessage.mutate({ message_type: "text", body: trimmed }, { onSuccess: () => setBody("") });
  }

  function submitTemplate(template: WhatsAppTemplateRead, variables: string[]) {
    sendMessage.mutate(
      {
        message_type: "template",
        template_name: template.name,
        template_language: template.language,
        template_variables: variables,
      },
      { onSuccess: () => setMode("text") },
    );
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      submitText();
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) sendMedia.mutate({ file });
    e.target.value = "";
  }

  if (!windowOpen) {
    return (
      <div className="border-t border-border p-3">
        <p className="mb-3 flex items-center gap-1.5 text-xs text-warning">
          <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          This conversation's 24-hour reply window has closed. Send an approved template to reach out again.
        </p>
        <TemplatePicker onSend={submitTemplate} sending={sendMessage.isPending} />
      </div>
    );
  }

  if (mode === "template") {
    return (
      <div className="space-y-2 border-t border-border p-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-muted-foreground">Send a template</p>
          <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => setMode("text")}>
            Cancel
          </Button>
        </div>
        <TemplatePicker onSend={submitTemplate} sending={sendMessage.isPending} />
      </div>
    );
  }

  return (
    <div className="space-y-2 border-t border-border p-3">
      <Textarea
        rows={2}
        placeholder="Type a message…"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        onKeyDown={onKeyDown}
      />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx"
            onChange={handleFileChange}
          />
          <Button
            variant="outline"
            size="sm"
            className="h-7 gap-1.5 text-xs"
            disabled={sendMedia.isPending}
            onClick={() => fileInputRef.current?.click()}
          >
            {sendMedia.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Paperclip className="h-3.5 w-3.5" />}
            Attach
          </Button>
          <Button variant="outline" size="sm" className="h-7 gap-1.5 text-xs" onClick={() => setMode("template")}>
            <FileText className="h-3.5 w-3.5" /> Template
          </Button>
        </div>
        <Button size="sm" disabled={!body.trim() || sendMessage.isPending} onClick={submitText}>
          {sendMessage.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Send
        </Button>
      </div>
    </div>
  );
}
