import { useRef, useState } from "react";
import { Bold, CheckSquare, Heading2, Italic, Link as LinkIcon, List, ListOrdered, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MarkdownContent } from "./markdown";

interface ToolbarAction {
  icon: typeof Bold;
  label: string;
  apply: (selected: string) => { text: string; cursorOffset?: number };
}

const ACTIONS: ToolbarAction[] = [
  { icon: Bold, label: "Bold", apply: (s) => ({ text: `**${s || "bold text"}**` }) },
  { icon: Italic, label: "Italic", apply: (s) => ({ text: `*${s || "italic text"}*` }) },
  { icon: Heading2, label: "Heading", apply: (s) => ({ text: `## ${s || "Heading"}` }) },
  { icon: List, label: "Bullet list", apply: (s) => ({ text: (s || "List item").split("\n").map((l) => `- ${l}`).join("\n") }) },
  { icon: ListOrdered, label: "Numbered list", apply: (s) => ({ text: (s || "List item").split("\n").map((l, i) => `${i + 1}. ${l}`).join("\n") }) },
  { icon: CheckSquare, label: "Checklist", apply: (s) => ({ text: (s || "To do").split("\n").map((l) => `- [ ] ${l}`).join("\n") }) },
  { icon: Quote, label: "Quote", apply: (s) => ({ text: `> ${s || "Quote"}` }) },
  { icon: LinkIcon, label: "Link", apply: (s) => ({ text: `[${s || "link text"}](https://)` }) },
];

export function MarkdownEditor({
  value,
  onChange,
  rows = 12,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  const [tab, setTab] = useState<"write" | "preview">("write");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function applyAction(action: ToolbarAction) {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = value.slice(start, end);
    const { text } = action.apply(selected);
    const next = value.slice(0, start) + text + value.slice(end);
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + text.length, start + text.length);
    });
  }

  return (
    <Tabs value={tab} onValueChange={(v) => setTab(v as "write" | "preview")}>
      <div className="mb-1.5 flex items-center justify-between">
        <div className="flex items-center gap-0.5">
          {ACTIONS.map((action) => (
            <Button
              key={action.label}
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground"
              title={action.label}
              onClick={() => applyAction(action)}
            >
              <action.icon className="h-3.5 w-3.5" />
            </Button>
          ))}
        </div>
        <TabsList>
          <TabsTrigger value="write">Write</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="write" className="mt-0">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          placeholder={placeholder}
          className="font-mono text-[13px]"
        />
      </TabsContent>
      <TabsContent value="preview" className="mt-0 rounded-lg border border-border p-4" style={{ minHeight: `${rows * 1.6}rem` }}>
        {value.trim() ? <MarkdownContent content={value} /> : <p className="text-sm text-muted-foreground">Nothing to preview yet.</p>}
      </TabsContent>
    </Tabs>
  );
}
