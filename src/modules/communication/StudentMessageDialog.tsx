import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CommunicationKind } from "@/types/enums";
import { useCreateConversation } from "./hooks";
import { ConversationThread } from "./ConversationThread";

interface StudentMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Auto-provisions the student's single shared support conversation on open —
 * students don't pick a recipient, they just message the org. */
export function StudentMessageDialog({ open, onOpenChange }: StudentMessageDialogProps) {
  const createConversation = useCreateConversation();

  useEffect(() => {
    if (open && !createConversation.data) {
      createConversation.mutate({ kind: CommunicationKind.STUDENT });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[600px] max-w-lg flex-col p-0">
        <DialogHeader className="border-b border-border px-4 py-3">
          <DialogTitle>Messages</DialogTitle>
        </DialogHeader>
        {createConversation.data ? (
          <ConversationThread conversationId={createConversation.data.id} className="min-h-0 flex-1" />
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
