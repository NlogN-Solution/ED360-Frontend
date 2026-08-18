import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { MultiStaffPicker } from "@/modules/people/StaffPicker";
import { useDepartments } from "@/modules/people/hooks";
import { useJobRoles } from "@/modules/jobRoles/hooks";
import { useCreateDuty, useUpdateDuty } from "./hooks";
import { MarkdownEditor } from "./MarkdownEditor";
import { MultiCheckList } from "@/components/shared/MultiCheckList";
import type { Duty } from "./types";
import { DutyPriority, DutyType } from "@/types/enums";
import { toTitleCase } from "@/utils/format";

const CATEGORY_SUGGESTIONS = [
  "Student Management",
  "Student Communication",
  "Application Processing",
  "Documentation",
  "University Relations",
  "Visa Processing",
  "Professional Conduct",
  "Confidentiality",
  "Compliance",
  "Internal Operations",
  "Finance",
  "Attendance",
  "General",
];

export function DutyFormDialog({ duty, open, onOpenChange }: { duty: Duty | null; open: boolean; onOpenChange: (open: boolean) => void }) {
  const isEditing = duty !== null;
  const create = useCreateDuty();
  const update = useUpdateDuty(duty?.id ?? "");
  const { data: jobRoles } = useJobRoles();
  const { data: departments } = useDepartments({ limit: 100 });

  const [title, setTitle] = useState("");
  const [type, setType] = useState<DutyType>(DutyType.ROLE_RESPONSIBILITY);
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState<DutyPriority>(DutyPriority.NORMAL);
  const [content, setContent] = useState("");
  const [requiresAck, setRequiresAck] = useState(false);
  const [ackDeadline, setAckDeadline] = useState("");
  const [effectiveFrom, setEffectiveFrom] = useState("");
  const [reviewDate, setReviewDate] = useState("");
  const [jobRoleIds, setJobRoleIds] = useState<string[]>([]);
  const [departmentIds, setDepartmentIds] = useState<string[]>([]);
  const [userIds, setUserIds] = useState<string[]>([]);
  const [publishNow, setPublishNow] = useState(false);

  useEffect(() => {
    if (!open) return;
    setTitle(duty?.title ?? "");
    setType(duty?.type ?? DutyType.ROLE_RESPONSIBILITY);
    setCategory(duty?.category ?? "");
    setPriority(duty?.priority ?? DutyPriority.NORMAL);
    setContent(duty?.content ?? "");
    setRequiresAck(duty?.requires_acknowledgement ?? false);
    setAckDeadline(duty?.acknowledgement_deadline ?? "");
    setEffectiveFrom(duty?.effective_from ?? "");
    setReviewDate(duty?.review_date ?? "");
    setJobRoleIds(duty?.job_roles.map((r) => r.id) ?? []);
    setDepartmentIds(duty?.departments.map((d) => d.id) ?? []);
    setUserIds(duty?.users.map((u) => u.id) ?? []);
    setPublishNow(false);
  }, [open, duty]);

  const isPending = create.isPending || update.isPending;
  const canSave = title.trim().length > 0 && content.trim().length > 0;

  function handleSave() {
    if (!canSave) return;
    const payload = {
      title: title.trim(),
      content: content.trim(),
      type,
      category: category.trim() || null,
      priority,
      requires_acknowledgement: requiresAck,
      acknowledgement_deadline: requiresAck ? ackDeadline || null : null,
      effective_from: effectiveFrom || null,
      review_date: reviewDate || null,
      job_role_ids: jobRoleIds,
      department_ids: departmentIds,
      user_ids: userIds,
    };
    if (isEditing) {
      update.mutate(payload, { onSuccess: () => onOpenChange(false) });
    } else {
      create.mutate({ ...payload, publish: publishNow }, { onSuccess: () => onOpenChange(false) });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit duty" : "New duty"}</DialogTitle>
        </DialogHeader>

        <div className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
          <div className="space-y-1.5">
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Education Counsellor — Roles & Responsibilities" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as DutyType)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(DutyType).map((v) => (
                    <SelectItem key={v} value={v}>
                      {toTitleCase(v)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Optional" list="duty-category-suggestions" />
              <datalist id="duty-category-suggestions">
                {CATEGORY_SUGGESTIONS.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as DutyPriority)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(DutyPriority).map((v) => (
                    <SelectItem key={v} value={v}>
                      {toTitleCase(v)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Content</Label>
            <MarkdownEditor value={content} onChange={setContent} rows={10} placeholder="Describe the responsibility, policy, or procedure…" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Effective from</Label>
              <Input type="date" value={effectiveFrom} onChange={(e) => setEffectiveFrom(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Review date</Label>
              <Input type="date" value={reviewDate} onChange={(e) => setReviewDate(e.target.value)} />
            </div>
          </div>

          <div className="rounded-lg border border-border p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Requires acknowledgement</p>
                <p className="text-xs text-muted-foreground">Staff must confirm they've read this before it's considered done.</p>
              </div>
              <Switch checked={requiresAck} onCheckedChange={setRequiresAck} />
            </div>
            {requiresAck && (
              <div className="mt-3 space-y-1.5">
                <Label>Acknowledgement deadline</Label>
                <Input type="date" value={ackDeadline} onChange={(e) => setAckDeadline(e.target.value)} className="w-48" />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Assigned roles</Label>
              <MultiCheckList
                options={(jobRoles ?? []).map((r) => ({ id: r.id, label: r.name }))}
                value={jobRoleIds}
                onChange={setJobRoleIds}
                emptyMessage="No job roles yet — add one from Duties settings."
              />
            </div>
            <div className="space-y-1.5">
              <Label>Assigned departments</Label>
              <MultiCheckList
                options={(departments?.items ?? []).map((d) => ({ id: d.id, label: d.name }))}
                value={departmentIds}
                onChange={setDepartmentIds}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Assigned staff (individual exceptions)</Label>
            <MultiStaffPicker value={userIds} onChange={setUserIds} placeholder="Add specific people…" />
          </div>

          {!isEditing && (
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <p className="text-sm font-medium text-foreground">Publish immediately</p>
                <p className="text-xs text-muted-foreground">Otherwise this is saved as a draft, visible only to admins.</p>
              </div>
              <Switch checked={publishNow} onCheckedChange={setPublishNow} />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={!canSave || isPending} onClick={handleSave}>
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {isEditing ? "Save" : publishNow ? "Create & publish" : "Save as draft"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
