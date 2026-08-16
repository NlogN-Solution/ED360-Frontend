import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getErrorMessage } from "@/utils/errors";
import { useConnectEmailGoogle, useEmailOAuthConfig } from "./hooks";
import { runGoogleOAuth } from "./googleOAuth";

interface ConnectEmailFlowProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Unlike WhatsApp, there's no manual-token fallback here — a Gmail access
// token isn't something an org admin can safely obtain and paste in
// themselves (Google doesn't issue long-lived "system user" style tokens
// through a self-service UI the way Meta does). "Continue with Google" is
// the only path in; if it's not configured, the dialog says so.
export function ConnectEmailFlow({ open, onOpenChange }: ConnectEmailFlowProps) {
  const { data: oauthConfig, isLoading: configLoading } = useEmailOAuthConfig({ enabled: open });
  const connect = useConnectEmailGoogle();
  const [popupPending, setPopupPending] = useState(false);

  function close() {
    onOpenChange(false);
  }

  async function startGoogleOAuth() {
    if (!oauthConfig) return;
    setPopupPending(true);
    try {
      const result = await runGoogleOAuth(oauthConfig.client_id);
      await connect.mutateAsync({ code: result.code, redirect_uri: result.redirectUri });
      close();
    } catch (error) {
      toast.error(getErrorMessage(error, "Google sign-in didn't complete"));
    } finally {
      setPopupPending(false);
    }
  }

  const busy = popupPending || connect.isPending;

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? onOpenChange(next) : close())}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect email</DialogTitle>
          <DialogDescription>
            Sign in with your organization's Google account — you'll grant access to a single Gmail inbox in a
            secure Google popup. Ignition never sees your Google password.
          </DialogDescription>
        </DialogHeader>

        {configLoading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : oauthConfig ? (
          <Button className="w-full" disabled={busy} onClick={startGoogleOAuth}>
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            Continue with Google
          </Button>
        ) : (
          <p className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
            Email sign-in isn't configured on this server yet. Ask a platform administrator to set it up.
          </p>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={close}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
