import { useEffect, useState } from "react";
import { Loader2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { useNotificationTemplates, useUpdateNotificationTemplate } from "@/modules/notificationTemplates/hooks";
import { TEMPLATE_LABELS, TEMPLATE_PLACEHOLDERS } from "@/modules/notificationTemplates/types";
import type { NotificationTemplateRead } from "@/modules/notificationTemplates/types";

function TemplateEditDialog({
  template,
  open,
  onOpenChange,
}: {
  template: NotificationTemplateRead;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const update = useUpdateNotificationTemplate();
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (open) {
      setSubject(template.subject);
      setBody(template.body);
      setIsActive(template.is_active);
    }
  }, [open, template]);

  function handleSubmit() {
    update.mutate(
      { key: template.key, payload: { subject, body, is_active: isActive } },
      { onSuccess: () => onOpenChange(false) },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{TEMPLATE_LABELS[template.key]}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Subject</Label>
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Body</Label>
            <Textarea rows={5} value={body} onChange={(e) => setBody(e.target.value)} />
          </div>
          <p className="text-xs text-muted-foreground">
            Available placeholders: {TEMPLATE_PLACEHOLDERS[template.key].join(", ")}
          </p>
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div>
              <Label className="cursor-pointer">Active</Label>
              <p className="text-xs text-muted-foreground">When off, the default text is used instead.</p>
            </div>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={!subject || !body || update.isPending} onClick={handleSubmit}>
            {update.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function EmailTemplatesTab() {
  const { data, isLoading } = useNotificationTemplates();
  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplateRead | null>(null);

  if (isLoading || !data) {
    return <Skeleton className="h-96 w-full rounded-xl" />;
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-[13px] font-semibold text-foreground">Email &amp; notification templates</h2>
        <p className="text-xs text-muted-foreground">
          Customize the messages sent to students and staff at key moments. These power in-app notifications, not outbound
          email.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {data.items.map((template) => (
          <div key={template.key} className="rounded-xl border border-border bg-card p-4">
            <div className="mb-2 flex items-start justify-between gap-2">
              <div>
                <h3 className="text-[13px] font-semibold text-foreground">{TEMPLATE_LABELS[template.key]}</h3>
                {!template.is_active && <p className="text-[11px] text-muted-foreground">Inactive — using default text</p>}
              </div>
              <Button variant="outline" size="sm" onClick={() => setEditingTemplate(template)}>
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </Button>
            </div>
            <p className="truncate text-xs font-medium text-foreground">{template.subject}</p>
            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{template.body}</p>
          </div>
        ))}
      </div>

      {editingTemplate && (
        <TemplateEditDialog
          template={editingTemplate}
          open={!!editingTemplate}
          onOpenChange={(open) => !open && setEditingTemplate(null)}
        />
      )}
    </div>
  );
}
