import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UserPicker } from "@/components/shared/UserPicker";
import { IntakePicker } from "@/modules/academic/pickers";
import { UserRole } from "@/types/enums";
import { useUpdateApplication } from "./hooks";
import type { ApplicationRead } from "./types";

interface ApplicationEditDialogProps {
  application: ApplicationRead;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ApplicationEditDialog({ application, open, onOpenChange }: ApplicationEditDialogProps) {
  const updateApplication = useUpdateApplication(application.id);

  const [counsellorId, setCounsellorId] = useState<string | undefined>();
  const [intakeId, setIntakeId] = useState<string | undefined>();
  const [tuitionFee, setTuitionFee] = useState("");
  const [scholarship, setScholarship] = useState("");
  const [universityApplicationId, setUniversityApplicationId] = useState("");
  const [remarks, setRemarks] = useState("");
  const [applicationDate, setApplicationDate] = useState("");
  const [submissionDate, setSubmissionDate] = useState("");
  const [offerReceivedDate, setOfferReceivedDate] = useState("");
  const [visaAppliedDate, setVisaAppliedDate] = useState("");
  const [visaDecisionDate, setVisaDecisionDate] = useState("");
  const [enrollmentDate, setEnrollmentDate] = useState("");

  useEffect(() => {
    if (open) {
      setCounsellorId(application.counsellor_id ?? undefined);
      setIntakeId(application.intake_id ?? undefined);
      setTuitionFee(application.tuition_fee != null ? String(application.tuition_fee) : "");
      setScholarship(application.scholarship_amount != null ? String(application.scholarship_amount) : "");
      setUniversityApplicationId(application.university_application_id ?? "");
      setRemarks(application.remarks ?? "");
      setApplicationDate(application.application_date ?? "");
      setSubmissionDate(application.submission_date ?? "");
      setOfferReceivedDate(application.offer_received_date ?? "");
      setVisaAppliedDate(application.visa_applied_date ?? "");
      setVisaDecisionDate(application.visa_decision_date ?? "");
      setEnrollmentDate(application.enrollment_date ?? "");
    }
  }, [open, application]);

  function handleSubmit() {
    updateApplication.mutate(
      {
        counsellor_id: counsellorId ?? null,
        intake_id: intakeId ?? null,
        tuition_fee: tuitionFee ? Number(tuitionFee) : null,
        scholarship_amount: scholarship ? Number(scholarship) : null,
        university_application_id: universityApplicationId || null,
        remarks: remarks || null,
        application_date: applicationDate || null,
        submission_date: submissionDate || null,
        offer_received_date: offerReceivedDate || null,
        visa_applied_date: visaAppliedDate || null,
        visa_decision_date: visaDecisionDate || null,
        enrollment_date: enrollmentDate || null,
      },
      { onSuccess: () => onOpenChange(false) },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit application</DialogTitle>
        </DialogHeader>
        <div className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Counsellor</Label>
              <UserPicker value={counsellorId} onChange={setCounsellorId} role={UserRole.COUNSELLOR} placeholder="Assign a counsellor…" />
            </div>
            <div className="space-y-1.5">
              <Label>Intake</Label>
              <IntakePicker value={intakeId} onChange={setIntakeId} programId={application.program_id} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Tuition fee</Label>
              <Input type="number" value={tuitionFee} onChange={(e) => setTuitionFee(e.target.value)} placeholder="0.00" />
            </div>
            <div className="space-y-1.5">
              <Label>Scholarship</Label>
              <Input type="number" value={scholarship} onChange={(e) => setScholarship(e.target.value)} placeholder="0.00" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>University application ID</Label>
            <Input
              value={universityApplicationId}
              onChange={(e) => setUniversityApplicationId(e.target.value)}
              placeholder="Reference ID from the university's portal"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Timeline dates</Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-normal">Application date</Label>
                <Input type="date" value={applicationDate} onChange={(e) => setApplicationDate(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-normal">Submission date</Label>
                <Input type="date" value={submissionDate} onChange={(e) => setSubmissionDate(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-normal">Offer received</Label>
                <Input type="date" value={offerReceivedDate} onChange={(e) => setOfferReceivedDate(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-normal">Visa applied</Label>
                <Input type="date" value={visaAppliedDate} onChange={(e) => setVisaAppliedDate(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-normal">Visa decision</Label>
                <Input type="date" value={visaDecisionDate} onChange={(e) => setVisaDecisionDate(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-normal">Enrollment date</Label>
                <Input type="date" value={enrollmentDate} onChange={(e) => setEnrollmentDate(e.target.value)} />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} rows={2} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={updateApplication.isPending} onClick={handleSubmit}>
            {updateApplication.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
