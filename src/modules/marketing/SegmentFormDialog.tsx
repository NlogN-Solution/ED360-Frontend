import { useEffect, useState } from "react";
import { Loader2, Search } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MultiCheckList } from "@/components/shared/MultiCheckList";
import { MultiStaffPicker } from "@/modules/people/StaffPicker";
import { useCreateAudienceSegment, usePreviewFilters, useUpdateAudienceSegment } from "./hooks";
import { EMPTY_SEGMENT_FILTERS, type AudienceSegment, type SegmentFilters } from "./types";
import { LeadPriority, LeadSource, LeadStatus } from "@/types/enums";
import { toTitleCase } from "@/utils/format";

function enumOptions(values: Record<string, string>) {
  return Object.values(values).map((v) => ({ id: v, label: toTitleCase(v) }));
}

export function SegmentFormDialog({
  segment,
  open,
  onOpenChange,
}: {
  segment: AudienceSegment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const isEditing = segment !== null;
  const create = useCreateAudienceSegment();
  const update = useUpdateAudienceSegment(segment?.id ?? "");
  const preview = usePreviewFilters();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [filters, setFilters] = useState<SegmentFilters>(EMPTY_SEGMENT_FILTERS);
  const [tagsInput, setTagsInput] = useState("");

  useEffect(() => {
    if (!open) return;
    setName(segment?.name ?? "");
    setDescription(segment?.description ?? "");
    setFilters(segment?.filters ?? EMPTY_SEGMENT_FILTERS);
    setTagsInput(segment?.filters.tags.join(", ") ?? "");
    preview.reset();
  }, [open, segment]);

  const isPending = create.isPending || update.isPending;
  const canSave = name.trim().length > 0;

  function updateFilter<K extends keyof SegmentFilters>(key: K, value: SegmentFilters[K]) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  function handlePreview() {
    preview.mutate({ ...filters, tags: tagsInput.split(",").map((t) => t.trim()).filter(Boolean) });
  }

  function handleSave() {
    if (!canSave) return;
    const payload = {
      name: name.trim(),
      description: description.trim() || null,
      filters: { ...filters, tags: tagsInput.split(",").map((t) => t.trim()).filter(Boolean) },
    };
    if (isEditing) {
      update.mutate(payload, { onSuccess: () => onOpenChange(false) });
    } else {
      create.mutate(payload, { onSuccess: () => onOpenChange(false) });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit segment" : "New audience segment"}</DialogTitle>
        </DialogHeader>

        <div className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Hot leads from Website" />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>Source</Label>
              <MultiCheckList options={enumOptions(LeadSource)} value={filters.source} onChange={(v) => updateFilter("source", v as LeadSource[])} />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <MultiCheckList options={enumOptions(LeadStatus)} value={filters.status} onChange={(v) => updateFilter("status", v as LeadStatus[])} />
            </div>
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <MultiCheckList
                options={enumOptions(LeadPriority)}
                value={filters.priority}
                onChange={(v) => updateFilter("priority", v as LeadPriority[])}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Interested country</Label>
              <Input
                value={filters.interested_country ?? ""}
                onChange={(e) => updateFilter("interested_country", e.target.value || null)}
                placeholder="Optional — matches partially"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Interested course</Label>
              <Input
                value={filters.interested_course ?? ""}
                onChange={(e) => updateFilter("interested_course", e.target.value || null)}
                placeholder="Optional — matches partially"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Tags</Label>
            <Input value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} placeholder="Comma-separated, e.g. urgent, referral" />
          </div>

          <div className="space-y-1.5">
            <Label>Assigned to</Label>
            <MultiStaffPicker value={filters.assigned_to} onChange={(v) => updateFilter("assigned_to", v)} placeholder="Any counsellor" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Created from</Label>
              <Input type="date" value={filters.created_from ?? ""} onChange={(e) => updateFilter("created_from", e.target.value || null)} />
            </div>
            <div className="space-y-1.5">
              <Label>Created to</Label>
              <Input type="date" value={filters.created_to ?? ""} onChange={(e) => updateFilter("created_to", e.target.value || null)} />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div>
              <Button variant="outline" size="sm" disabled={preview.isPending} onClick={handlePreview}>
                {preview.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
                Preview
              </Button>
            </div>
            {preview.data && (
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{preview.data.total}</span> matching lead{preview.data.total === 1 ? "" : "s"}
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={!canSave || isPending} onClick={handleSave}>
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {isEditing ? "Save" : "Create segment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
