// Popup-based Google OAuth for the "Continue with Google" email connect
// flow. Unlike Meta's Embedded Signup (which ships its own JS SDK), Google's
// OAuth is the plain redirect-based flow — so this module opens a popup
// pointed at Google's own consent screen, whose redirect_uri is our own
// callback page (see pages/oauth/GoogleOAuthCallbackPage.tsx). That page
// reads `code` off the URL and posts it back to this window, then closes
// itself. The backend never sees this file's code — it only ever receives
// the final authorization `code` via POST /integrations/email/connect/google.

// Must exactly match gmail_client.OAUTH_SCOPES on the backend — that's the
// single source of truth for what a connected account can actually do;
// keep both in sync if either changes. gmail.readonly + gmail.send, not
// gmail.modify — see that file's comment for why (avoids Google's
// restricted-scope CASA security assessment requirement).
const OAUTH_SCOPES = "https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send";
const AUTH_TIMEOUT_MS = 5 * 60 * 1000;

export interface GoogleOAuthResult {
  code: string;
  redirectUri: string;
}

export function googleOAuthRedirectUri(): string {
  return `${window.location.origin}/oauth/google/callback`;
}

export async function runGoogleOAuth(clientId: string): Promise<GoogleOAuthResult> {
  const redirectUri = googleOAuthRedirectUri();
  const state = crypto.randomUUID();

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: OAUTH_SCOPES,
    access_type: "offline", // required to get a refresh_token back
    prompt: "consent", // forces a refresh_token on every connect, not just the first-ever one
    state,
  });
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

  const popup = window.open(authUrl, "google-oauth", "width=520,height=680");
  if (!popup) {
    throw new Error("Couldn't open the Google sign-in popup — check your browser's popup blocker.");
  }

  return new Promise<GoogleOAuthResult>((resolve, reject) => {
    const timer = window.setTimeout(() => {
      cleanup();
      reject(new Error("Timed out waiting for Google sign-in."));
    }, AUTH_TIMEOUT_MS);

    // The popup can be closed by the user (clicking the X, or "Cancel" on
    // Google's own consent screen never posting a message back) — poll for
    // that separately from the message listener below.
    const closedCheck = window.setInterval(() => {
      if (popup.closed) {
        cleanup();
        reject(new Error("Google sign-in was cancelled."));
      }
    }, 500);

    function cleanup() {
      window.clearTimeout(timer);
      window.clearInterval(closedCheck);
      window.removeEventListener("message", handleMessage);
      if (!popup?.closed) popup?.close();
    }

    function handleMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      const data = event.data as { type?: string; code?: string; state?: string; error?: string };
      if (data?.type !== "GOOGLE_OAUTH_CALLBACK") return;
      cleanup();
      if (data.error) {
        reject(new Error(data.error === "access_denied" ? "Google sign-in was cancelled." : data.error));
        return;
      }
      if (!data.code || data.state !== state) {
        reject(new Error("Google sign-in response didn't match this request."));
        return;
      }
      resolve({ code: data.code, redirectUri });
    }

    window.addEventListener("message", handleMessage);
  });
}
