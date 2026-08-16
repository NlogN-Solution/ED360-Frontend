import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/utils/format";

interface CheckInOutDialogProps {
  mode: "check-in" | "check-out";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (notes: string) => void;
  isPending: boolean;
}

export function CheckInOutDialog({ mode, open, onOpenChange, onSubmit, isPending }: CheckInOutDialogProps) {
  const [notes, setNotes] = useState("");
  const isCheckIn = mode === "check-in";

  useEffect(() => {
    if (open) setNotes("");
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{isCheckIn ? "Check in" : "Check out"}</DialogTitle>
          <DialogDescription>{formatDate(new Date().toISOString())}</DialogDescription>
        </DialogHeader>
        <div className="space-y-1.5">
          <Label>{isCheckIn ? "What will I do today?" : "What did I do today?"}</Label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            placeholder={isCheckIn ? "e.g. Follow up with 3 leads, prep visa docs…" : "e.g. Called all leads, submitted visa docs…"}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={isPending} onClick={() => onSubmit(notes)}>
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {isCheckIn ? "Check in" : "Check out"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
