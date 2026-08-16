import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UniversityPicker } from "./pickers";
import { useUpdateProgram } from "./hooks";
import type { ProgramRead } from "./types";
import { DegreeLevel } from "@/types/enums";
import { toTitleCase } from "@/utils/format";

interface ProgramEditDialogProps {
  program: ProgramRead;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProgramEditDialog({ program, open, onOpenChange }: ProgramEditDialogProps) {
  const updateProgram = useUpdateProgram(program.id);
  const [name, setName] = useState("");
  const [universityId, setUniversityId] = useState<string | undefined>();
  const [degreeLevel, setDegreeLevel] = useState<string>(DegreeLevel.BACHELOR);
  const [fieldOfStudy, setFieldOfStudy] = useState("");
  const [durationMonths, setDurationMonths] = useState("");
  const [tuitionFee, setTuitionFee] = useState("");
  const [currency, setCurrency] = useState("");
  const [minimumGpa, setMinimumGpa] = useState("");
  const [minimumIelts, setMinimumIelts] = useState("");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (open) {
      setName(program.name);
      setUniversityId(program.university_id);
      setDegreeLevel(program.degree_level ?? DegreeLevel.BACHELOR);
      setFieldOfStudy(program.field_of_study ?? "");
      setDurationMonths(program.duration_months != null ? String(program.duration_months) : "");
      setTuitionFee(program.tuition_fee != null ? String(program.tuition_fee) : "");
      setCurrency(program.currency ?? "");
      setMinimumGpa(program.minimum_gpa != null ? String(program.minimum_gpa) : "");
      setMinimumIelts(program.minimum_ielts != null ? String(program.minimum_ielts) : "");
      setIsActive(program.is_active);
    }
  }, [open, program]);

  function handleSubmit() {
    if (!universityId) return;
    updateProgram.mutate(
      {
        name,
        university_id: universityId,
        degree_level: degreeLevel as DegreeLevel,
        field_of_study: fieldOfStudy || null,
        duration_months: durationMonths ? Number(durationMonths) : null,
        tuition_fee: tuitionFee ? Number(tuitionFee) : null,
        currency: currency || null,
        minimum_gpa: minimumGpa ? Number(minimumGpa) : null,
        minimum_ielts: minimumIelts ? Number(minimumIelts) : null,
        is_active: isActive,
      },
      { onSuccess: () => onOpenChange(false) },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit course</DialogTitle>
        </DialogHeader>
        <div className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
          <div className="space-y-1.5">
            <Label>Course name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>University</Label>
            <UniversityPicker value={universityId} onChange={setUniversityId} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Degree level</Label>
              <Select value={degreeLevel} onValueChange={setDegreeLevel}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(DegreeLevel).map((d) => (
                    <SelectItem key={d} value={d}>
                      {toTitleCase(d)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Field of study</Label>
              <Input value={fieldOfStudy} onChange={(e) => setFieldOfStudy(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>Duration (months)</Label>
              <Input type="number" value={durationMonths} onChange={(e) => setDurationMonths(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Tuition fee</Label>
              <Input type="number" value={tuitionFee} onChange={(e) => setTuitionFee(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Currency</Label>
              <Input value={currency} onChange={(e) => setCurrency(e.target.value.toUpperCase())} placeholder="AUD" maxLength={3} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Minimum GPA</Label>
              <Input type="number" step="0.01" value={minimumGpa} onChange={(e) => setMinimumGpa(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Minimum IELTS</Label>
              <Input type="number" step="0.5" value={minimumIelts} onChange={(e) => setMinimumIelts(e.target.value)} />
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <Label className="cursor-pointer">Active</Label>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={!name || !universityId || updateProgram.isPending} onClick={handleSubmit}>
            {updateProgram.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
