import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getErrorMessage } from "@/utils/errors";
import { useConnectWhatsApp, useConnectWhatsAppEmbeddedSignup, useWhatsAppEmbeddedSignupConfig } from "./hooks";
import { runWhatsAppEmbeddedSignup } from "./facebookEmbeddedSignup";

interface ConnectWhatsAppFlowProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Two paths into the same backend connection, in priority order:
//
// 1. Embedded Signup ("Continue with Meta") — a Meta-hosted popup handles
//    business/WABA/phone-number selection and OTP verification entirely on
//    Meta's own domain; we only ever receive an OAuth code plus the chosen
//    phone_number_id/waba_id, never a token. Shown only when the backend
//    reports META_APP_ID + a config_id are configured (see
//    useWhatsAppEmbeddedSignupConfig) — otherwise this button doesn't exist.
// 2. Manual entry — an org admin who already created their own Meta App +
//    WhatsApp Business Account pastes its Phone Number ID, WABA ID, and a
//    permanent access token. Always available as a fallback/advanced option,
//    since Embedded Signup requires Meta App Review before it works for
//    real (non-test) numbers.
export function ConnectWhatsAppFlow({ open, onOpenChange }: ConnectWhatsAppFlowProps) {
  const { data: embeddedConfig, isLoading: configLoading } = useWhatsAppEmbeddedSignupConfig({ enabled: open });
  const embeddedSignup = useConnectWhatsAppEmbeddedSignup();
  const [popupPending, setPopupPending] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);

  const [phoneNumberId, setPhoneNumberId] = useState("");
  const [wabaId, setWabaId] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const connect = useConnectWhatsApp();

  function reset() {
    setPhoneNumberId("");
    setWabaId("");
    setAccessToken("");
    setManualOpen(false);
  }

  function close() {
    onOpenChange(false);
    reset();
  }

  async function startEmbeddedSignup() {
    if (!embeddedConfig) return;
    setPopupPending(true);
    try {
      // Meta's exchangeable code expires ~30s after the popup issues it —
      // this must post to the backend immediately, no intermediate review
      // step or user confirmation between receiving it and sending it.
      const result = await runWhatsAppEmbeddedSignup(embeddedConfig.app_id, embeddedConfig.config_id);
      await embeddedSignup.mutateAsync({
        code: result.code,
        phone_number_id: result.phoneNumberId,
        whatsapp_business_account_id: result.wabaId,
      });
      close();
    } catch (error) {
      toast.error(getErrorMessage(error, "WhatsApp sign-in didn't complete"));
    } finally {
      setPopupPending(false);
    }
  }

  function submitManual() {
    if (!phoneNumberId.trim() || !wabaId.trim() || !accessToken.trim()) return;
    connect.mutate(
      {
        phone_number_id: phoneNumberId.trim(),
        whatsapp_business_account_id: wabaId.trim(),
        access_token: accessToken.trim(),
      },
      { onSuccess: close },
    );
  }

  const showManualForm = manualOpen || (!configLoading && !embeddedConfig);
  const busy = popupPending || embeddedSignup.isPending;

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? onOpenChange(next) : close())}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect WhatsApp Business</DialogTitle>
          <DialogDescription>
            {showManualForm
              ? "From your Meta Business Manager, create a WhatsApp Business App and copy its Phone Number ID, WhatsApp Business Account ID, and a permanent access token here. Ignition verifies these directly with Meta before connecting."
              : "Sign in with your organization's Meta Business account — you'll pick or create your WhatsApp Business Account in a secure Meta popup. Ignition never sees your Meta password."}
          </DialogDescription>
        </DialogHeader>

        {configLoading && (
          <div className="flex justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {!configLoading && !showManualForm && (
          <div className="space-y-3">
            <Button className="w-full" disabled={busy} onClick={startEmbeddedSignup}>
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              Continue with Meta
            </Button>
            <button
              type="button"
              className="w-full text-center text-xs text-muted-foreground underline-offset-2 hover:underline"
              onClick={() => setManualOpen(true)}
            >
              Enter credentials manually instead
            </button>
          </div>
        )}

        {!configLoading && showManualForm && (
          <div className="space-y-4">
            {embeddedConfig && (
              <button
                type="button"
                className="text-xs text-muted-foreground underline-offset-2 hover:underline"
                onClick={() => setManualOpen(false)}
              >
                ← Back to Meta sign-in
              </button>
            )}
            <div className="space-y-1.5">
              <Label>Phone number ID</Label>
              <Input value={phoneNumberId} onChange={(e) => setPhoneNumberId(e.target.value)} placeholder="e.g. 109876543210" />
            </div>
            <div className="space-y-1.5">
              <Label>WhatsApp Business Account ID</Label>
              <Input value={wabaId} onChange={(e) => setWabaId(e.target.value)} placeholder="e.g. 123456789012345" />
            </div>
            <div className="space-y-1.5">
              <Label>Access token</Label>
              <Input
                type="password"
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                placeholder="A permanent or system-user access token"
              />
              <p className="text-xs text-muted-foreground">
                Stored encrypted. Never shown again in Ignition after this step.
              </p>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={close}>
            Cancel
          </Button>
          {!configLoading && showManualForm && (
            <Button
              disabled={!phoneNumberId.trim() || !wabaId.trim() || !accessToken.trim() || connect.isPending}
              onClick={submitManual}
            >
              {connect.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Connect
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
