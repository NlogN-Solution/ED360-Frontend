import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState } from "@/components/shared/EmptyState";
import { FileText } from "lucide-react";
import { useSyncWhatsAppTemplates, useWhatsAppTemplates } from "./hooks";
import { WhatsAppTemplateStatus } from "@/types/enums";
import type { WhatsAppTemplateRead } from "./types";

interface TemplatePickerProps {
  onSend: (template: WhatsAppTemplateRead, variables: string[]) => void;
  sending: boolean;
}

export function TemplatePicker({ onSend, sending }: TemplatePickerProps) {
  const { data, isLoading } = useWhatsAppTemplates();
  const syncTemplates = useSyncWhatsAppTemplates();
  const [selectedId, setSelectedId] = useState<string>("");
  const [variables, setVariables] = useState<string[]>([]);

  const approved = (data?.items ?? []).filter((t) => t.status === WhatsAppTemplateStatus.APPROVED);
  const selected = approved.find((t) => t.id === selectedId);

  function selectTemplate(id: string) {
    setSelectedId(id);
    const template = approved.find((t) => t.id === id);
    setVariables(template ? Array(template.variable_count).fill("") : []);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (approved.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="No approved templates"
        description="Sync templates from Meta once your organization has some approved, or create one in Meta Business Manager."
        className="border-none py-6"
        action={
          <Button size="sm" variant="outline" disabled={syncTemplates.isPending} onClick={() => syncTemplates.mutate()}>
            {syncTemplates.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Sync templates
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label>Template</Label>
        <Select value={selectedId} onValueChange={selectTemplate}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Choose an approved template…" />
          </SelectTrigger>
          <SelectContent>
            {approved.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.name} ({t.language})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selected && (
        <>
          {selected.body_text && <p className="rounded-lg bg-muted p-2.5 text-xs text-muted-foreground">{selected.body_text}</p>}
          {variables.map((value, index) => (
            <div key={index} className="space-y-1.5">
              <Label>Variable {index + 1}</Label>
              <Input
                value={value}
                onChange={(e) => {
                  const next = [...variables];
                  next[index] = e.target.value;
                  setVariables(next);
                }}
              />
            </div>
          ))}
          <div className="flex justify-end">
            <Button
              size="sm"
              disabled={sending || variables.some((v) => !v.trim())}
              onClick={() => onSend(selected, variables)}
            >
              {sending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Send template
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
