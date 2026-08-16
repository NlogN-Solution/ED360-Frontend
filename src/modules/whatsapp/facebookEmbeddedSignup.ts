// Thin browser-side wrapper around Meta's Facebook JS SDK for WhatsApp
// Embedded Signup. This is the ONLY file in the WhatsApp module allowed to
// touch `window.FB` or talk to facebook.com directly — everything else goes
// through the backend. It never sees or stores a Meta access token: Meta's
// popup returns an OAuth `code`, and only the backend (which holds
// META_APP_SECRET) can exchange that for a real token.
//
// The SDK script is loaded lazily, only when a caller actually invokes
// runWhatsAppEmbeddedSignup — organizations whose server has no Embedded
// Signup config never load this third-party script at all.

declare global {
  interface Window {
    FB?: {
      init: (params: Record<string, unknown>) => void;
      login: (
        callback: (response: { authResponse?: { code?: string }; status?: string }) => void,
        params: Record<string, unknown>,
      ) => void;
    };
    fbAsyncInit?: () => void;
  }
}

export interface EmbeddedSignupResult {
  code: string;
  phoneNumberId: string;
  wabaId: string;
}

const FB_SDK_URL = "https://connect.facebook.net/en_US/sdk.js";
const FB_SDK_VERSION = "v21.0";
const SIGNUP_TIMEOUT_MS = 5 * 60 * 1000; // popup can sit open a while — OTP entry, business creation, etc.

let sdkLoadPromise: Promise<void> | null = null;

function loadFacebookSdk(appId: string): Promise<void> {
  if (window.FB) return Promise.resolve();
  if (sdkLoadPromise) return sdkLoadPromise;

  sdkLoadPromise = new Promise((resolve, reject) => {
    window.fbAsyncInit = () => {
      window.FB?.init({ appId, autoLogAppEvents: true, xfbml: false, version: FB_SDK_VERSION });
      resolve();
    };
    const existing = document.querySelector(`script[src="${FB_SDK_URL}"]`);
    if (existing) return; // fbAsyncInit above will still fire once the SDK finishes loading
    const script = document.createElement("script");
    script.src = FB_SDK_URL;
    script.async = true;
    script.defer = true;
    script.onerror = () => reject(new Error("Could not load the Meta sign-in SDK. Check your connection and try again."));
    document.body.appendChild(script);
  });
  return sdkLoadPromise;
}

// Meta's FB.login() callback only ever carries the OAuth `code` — the
// phone_number_id/waba_id the user actually picked inside the popup arrive
// separately, via a `window.postMessage` the popup sends as it finishes.
// Both have to be awaited and matched up to produce one signup result.
function waitForSignupMessage(): Promise<{ phoneNumberId: string; wabaId: string }> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => {
      window.removeEventListener("message", handleMessage);
      reject(new Error("Timed out waiting for the Meta sign-in popup."));
    }, SIGNUP_TIMEOUT_MS);

    function cleanup() {
      window.clearTimeout(timer);
      window.removeEventListener("message", handleMessage);
    }

    function handleMessage(event: MessageEvent) {
      if (event.origin !== "https://www.facebook.com" && event.origin !== "https://web.facebook.com") return;
      let data: { type?: string; event?: string; data?: Record<string, string> };
      try {
        data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
      } catch {
        return;
      }
      if (data?.type !== "WA_EMBEDDED_SIGNUP") return;

      if (data.event === "FINISH" || data.event === "FINISH_ONLY_WABA") {
        cleanup();
        const phoneNumberId = data.data?.phone_number_id ?? "";
        const wabaId = data.data?.waba_id ?? "";
        if (!phoneNumberId || !wabaId) {
          reject(new Error("Meta did not return a phone number for this WhatsApp Business Account."));
          return;
        }
        resolve({ phoneNumberId, wabaId });
      } else if (data.event === "CANCEL" || data.event === "ERROR") {
        cleanup();
        reject(new Error(data.data?.error_message || "WhatsApp sign-in was cancelled."));
      }
    }

    window.addEventListener("message", handleMessage);
  });
}

function runFacebookLogin(configId: string): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!window.FB) {
      reject(new Error("Meta sign-in SDK did not load."));
      return;
    }
    window.FB.login(
      (response) => {
        if (response.authResponse?.code) {
          resolve(response.authResponse.code);
        } else {
          reject(new Error("WhatsApp sign-in was cancelled or did not complete."));
        }
      },
      {
        // No sessionInfoVersion here on purpose — that parameter pinned the
        // flow to Embedded Signup v2/v3 (deprecated by Meta on 2026-10-15).
        // v4 replaced version-pinning with this: the Facebook Login for
        // Business configuration itself (config_id, set in the App
        // Dashboard) determines the flow version, so the SDK call is
        // version-agnostic and keeps working across Meta's own upgrades.
        config_id: configId,
        response_type: "code",
        override_default_response_type: true,
        extras: { setup: {} },
      },
    );
  });
}

export async function runWhatsAppEmbeddedSignup(appId: string, configId: string): Promise<EmbeddedSignupResult> {
  await loadFacebookSdk(appId);

  // Start listening before opening the popup — the FINISH message can in
  // principle arrive before FB.login()'s own callback does.
  const signupMessage = waitForSignupMessage();
  const code = await runFacebookLogin(configId);
  const { phoneNumberId, wabaId } = await signupMessage;

  return { code, phoneNumberId, wabaId };
}
