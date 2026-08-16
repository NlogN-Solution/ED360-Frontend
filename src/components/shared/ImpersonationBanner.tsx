import { Loader2, LogOut, ShieldAlert } from "lucide-react";
import { useAuthStore } from "@/services/authStore";
import { useExitImpersonation } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

export function ImpersonationBanner() {
  const impersonation = useAuthStore((s) => s.impersonation);
  const user = useAuthStore((s) => s.user);
  const exitImpersonation = useExitImpersonation();

  if (!impersonation) return null;

  return (
    <div className="flex items-center justify-between gap-3 bg-warning px-4 py-2 text-warning-foreground">
      <div className="flex items-center gap-2 text-[13px]">
        <ShieldAlert className="h-4 w-4 shrink-0" />
        <span>
          Viewing as <strong className="font-semibold">{user ? `${user.first_name} ${user.last_name}` : "…"}</strong> — impersonating on
          behalf of {impersonation.originalUserLabel}
        </span>
      </div>
      <Button
        size="sm"
        variant="secondary"
        className="h-7 gap-1.5 text-xs"
        disabled={exitImpersonation.isPending}
        onClick={() => exitImpersonation.mutate()}
      >
        {exitImpersonation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <LogOut className="h-3.5 w-3.5" />}
        Exit impersonation
      </Button>
    </div>
  );
}
