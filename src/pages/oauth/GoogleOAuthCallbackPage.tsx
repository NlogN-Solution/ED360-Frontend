import { useEffect } from "react";
import { Loader2 } from "lucide-react";

// The redirect_uri Google sends the browser back to after the consent
// screen. This page only ever runs inside the popup opened by
// modules/email/googleOAuth.ts — it reads the OAuth response off the URL,
// relays it to the window that opened the popup via postMessage (same
// origin, so no external domain can read or spoof this), then closes
// itself. It never calls the backend directly.
export function GoogleOAuthCallbackPage() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const state = params.get("state");
    const error = params.get("error");

    if (window.opener) {
      window.opener.postMessage({ type: "GOOGLE_OAUTH_CALLBACK", code, state, error }, window.location.origin);
    }
    window.close();
  }, []);

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-3 text-muted-foreground">
      <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
      <p className="text-sm">Finishing Google sign-in…</p>
      <p className="text-xs">You can close this window if it doesn't close automatically.</p>
    </div>
  );
}
