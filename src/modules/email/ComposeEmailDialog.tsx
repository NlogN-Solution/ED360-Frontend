import { useState } from "react";
import { Loader2, Paperclip, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useComposeEmail } from "./hooks";

interface ComposeEmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSent?: () => void;
}

// Unlike WhatsApp conversations (always inbound-first — there's no "start a
// new WhatsApp conversation" UI in that module), email threads are commonly
// counsellor-initiated — reaching out to a lead cold. This is that entry
// point.
export function ComposeEmailDialog({ open, onOpenChange, onSent }: ComposeEmailDialogProps) {
  const [to, setTo] = useState("");
  const [cc, setCc] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const compose = useComposeEmail();

  function reset() {
    setTo("");
    setCc("");
    setSubject("");
    setBody("");
    setFiles([]);
  }

  function close() {
    onOpenChange(false);
    reset();
  }

  function submit() {
    const toAddresses = to
      .split(",")
      .map((a) => a.trim())
      .filter(Boolean);
    if (!toAddresses.length || !subject.trim() || !body.trim()) return;
    const ccAddresses = cc
      .split(",")
      .map((a) => a.trim())
      .filter(Boolean);
    compose.mutate(
      {
        payload: { to: toAddresses, cc: ccAddresses.length ? ccAddresses : undefined, subject: subject.trim(), body_text: body },
        files,
      },
      {
        onSuccess: () => {
          close();
          onSent?.();
        },
      },
    );
  }

  const canSubmit = to.trim() && subject.trim() && body.trim() && !compose.isPending;

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? onOpenChange(next) : close())}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Compose email</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>To</Label>
            <Input value={to} onChange={(e) => setTo(e.target.value)} placeholder="lead@example.com" />
          </div>
          <div className="space-y-1.5">
            <Label>Cc (optional)</Label>
            <Input value={cc} onChange={(e) => setCc(e.target.value)} placeholder="colleague@example.com" />
          </div>
          <div className="space-y-1.5">
            <Label>Subject</Label>
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" />
          </div>
          <div className="space-y-1.5">
            <Label>Message</Label>
            <Textarea rows={6} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write your message…" />
          </div>
          {files.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {files.map((file, i) => (
                <span
                  key={`${file.name}-${i}`}
                  className="flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-[11px] text-muted-foreground"
                >
                  <Paperclip className="h-3 w-3 shrink-0" />
                  <span className="max-w-32 truncate">{file.name}</span>
                  <button type="button" onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
          <label className="inline-flex cursor-pointer items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
            <Paperclip className="h-3.5 w-3.5" />
            Attach files
            <input
              type="file"
              multiple
              className="hidden"
              onChange={(e) => {
                const picked = Array.from(e.target.files ?? []);
                if (picked.length) setFiles((prev) => [...prev, ...picked]);
                e.target.value = "";
              }}
            />
          </label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={close}>
            Cancel
          </Button>
          <Button disabled={!canSubmit} onClick={submit}>
            {compose.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Send
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
