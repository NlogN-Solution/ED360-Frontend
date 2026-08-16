import { useRef, useState, type KeyboardEvent } from "react";
import { Loader2, Paperclip, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSendEmailReply } from "./hooks";
import type { EmailThreadRead } from "./types";

export function MessageComposer({ thread }: { thread: EmailThreadRead }) {
  const [body, setBody] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sendReply = useSendEmailReply(thread.id);

  function submit() {
    const trimmed = body.trim();
    if (!trimmed) return;
    sendReply.mutate(
      { payload: { body_text: trimmed }, files },
      {
        onSuccess: () => {
          setBody("");
          setFiles([]);
        },
      },
    );
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      submit();
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []);
    if (picked.length) setFiles((prev) => [...prev, ...picked]);
    e.target.value = "";
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-2 border-t border-border p-3">
      {files.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {files.map((file, i) => (
            <span
              key={`${file.name}-${i}`}
              className="flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-[11px] text-muted-foreground"
            >
              <Paperclip className="h-3 w-3 shrink-0" />
              <span className="max-w-32 truncate">{file.name}</span>
              <button type="button" onClick={() => removeFile(i)} aria-label={`Remove ${file.name}`}>
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      <Textarea
        rows={3}
        placeholder="Write a reply…"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        onKeyDown={onKeyDown}
      />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileChange} />
          <Button
            variant="outline"
            size="sm"
            className="h-7 gap-1.5 text-xs"
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip className="h-3.5 w-3.5" />
            Attach
          </Button>
        </div>
        <Button size="sm" disabled={!body.trim() || sendReply.isPending} onClick={submit}>
          {sendReply.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Send
        </Button>
      </div>
    </div>
  );
}
