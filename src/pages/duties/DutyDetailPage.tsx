import { useState } from "react";
import { Link, useParams } from "react-router";
import { ArrowLeft, CheckCircle2, History, Loader2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useAuthStore } from "@/services/authStore";
import { canManageDuties } from "@/constants/permissions";
import { useAcknowledgeDuty, useDuty, useDutyVersions, usePublishDutyVersion } from "@/modules/duties/hooks";
import { DutyFormDialog } from "@/modules/duties/DutyFormDialog";
import { MarkdownContent } from "@/modules/duties/markdown";
import { DutyStatus } from "@/types/enums";
import { formatDate, formatDateTime, toTitleCase } from "@/utils/format";

export function DutyDetailPage() {
  const { dutyId } = useParams<{ dutyId: string }>();
  const currentUser = useAuthStore((s) => s.user);
  const canManage = canManageDuties(currentUser?.role);

  const { data: duty, isLoading } = useDuty(dutyId);
  const { data: versions } = useDutyVersions(canManage ? dutyId : undefined);
  const acknowledge = useAcknowledgeDuty(dutyId ?? "");
  const publishVersion = usePublishDutyVersion(dutyId ?? "");

  const [editOpen, setEditOpen] = useState(false);
  const [confirmAck, setConfirmAck] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-3 px-6 py-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-full" />
        ))}
      </div>
    );
  }

  if (!duty) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-5">
        <EmptyState icon={CheckCircle2} title="Duty not found" className="border-none py-16" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-5">
      <div className="mb-4 flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/duties">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Duties
          </Link>
        </Button>
        {canManage && (
          <div className="flex items-center gap-2">
            {versions && versions.length > 1 && (
              <Button variant="outline" size="sm" onClick={() => setShowHistory((v) => !v)}>
                <History className="h-3.5 w-3.5" /> Version history
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
              <Pencil className="h-3.5 w-3.5" /> Edit
            </Button>
          </div>
        )}
      </div>

      {showHistory && versions && (
        <div className="mb-4 space-y-2 rounded-xl border border-border bg-card p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Version history</p>
          {versions.map((v) => (
            <div key={v.id} className="flex items-center justify-between text-sm">
              <span className="text-foreground">
                Version {v.version} — {v.title}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {v.published_at ? `Published ${formatDateTime(v.published_at)}` : "Draft"}
                </span>
                {!v.published_at && (
                  <Button size="sm" variant="outline" disabled={publishVersion.isPending} onClick={() => publishVersion.mutate(v.version)}>
                    {publishVersion.isPending && <Loader2 className="h-3 w-3 animate-spin" />}
                    Publish
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-xl border border-border bg-card p-6">
        <div className="mb-4 border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-accent px-2.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider text-accent-foreground">
              {toTitleCase(duty.type)}
            </span>
            <StatusBadge status={duty.status} />
            {duty.priority !== "normal" && <StatusBadge status={duty.priority} />}
          </div>
          <h1 className="mt-2 text-[19px] font-semibold tracking-tight text-foreground">{duty.title}</h1>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span>Version {duty.version}</span>
            {duty.effective_from && <span>Effective {formatDate(duty.effective_from)}</span>}
            {duty.review_date && <span>Review by {formatDate(duty.review_date)}</span>}
          </div>
        </div>

        <MarkdownContent content={duty.content ?? ""} />

        {duty.requires_acknowledgement && (
          <div className="mt-6 rounded-lg border border-border p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Acknowledgement</p>
            {duty.is_acknowledged_by_me ? (
              <p className="mt-2 flex items-center gap-2 text-sm text-success">
                <CheckCircle2 className="h-4 w-4" /> You have acknowledged this version.
              </p>
            ) : (
              <>
                <p className="mt-2 text-sm text-muted-foreground">
                  I have read and understood this document.
                  {duty.acknowledgement_deadline && ` Please acknowledge by ${formatDate(duty.acknowledgement_deadline)}.`}
                </p>
                <Button className="mt-3" size="sm" disabled={duty.status !== DutyStatus.PUBLISHED} onClick={() => setConfirmAck(true)}>
                  Acknowledge
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      {canManage && <DutyFormDialog duty={duty} open={editOpen} onOpenChange={setEditOpen} />}

      <ConfirmDialog
        open={confirmAck}
        onOpenChange={setConfirmAck}
        title="Acknowledge this duty?"
        description="This confirms you've read and understood the current version. It's recorded against your account."
        confirmLabel="I acknowledge"
        isPending={acknowledge.isPending}
        onConfirm={() => acknowledge.mutate(undefined, { onSuccess: () => setConfirmAck(false) })}
      />
    </div>
  );
}
