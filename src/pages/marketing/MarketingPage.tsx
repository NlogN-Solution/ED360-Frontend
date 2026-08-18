import { useState } from "react";
import { Megaphone, Plus, Trash2, Users } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useAudienceSegments, useDeleteAudienceSegment } from "@/modules/marketing/hooks";
import { SegmentFormDialog } from "@/modules/marketing/SegmentFormDialog";
import { SegmentPreviewDialog } from "@/modules/marketing/SegmentPreviewDialog";
import type { AudienceSegment } from "@/modules/marketing/types";
import { formatDate } from "@/utils/format";

export function MarketingPage() {
  const [tab, setTab] = useState<"audiences" | "campaigns">("audiences");
  const [formOpen, setFormOpen] = useState(false);
  const [editingSegment, setEditingSegment] = useState<AudienceSegment | null>(null);
  const [previewSegment, setPreviewSegment] = useState<AudienceSegment | null>(null);
  const [deletingSegment, setDeletingSegment] = useState<AudienceSegment | null>(null);

  const { data, isLoading } = useAudienceSegments();
  const deleteSegment = useDeleteAudienceSegment();
  const segments = data?.items ?? [];

  return (
    <div>
      <PageHeader
        title="Marketing"
        description="Build audiences from your leads, and (soon) reach them with WhatsApp campaigns."
        actions={
          tab === "audiences" && (
            <Button
              size="sm"
              onClick={() => {
                setEditingSegment(null);
                setFormOpen(true);
              }}
            >
              <Plus className="h-3.5 w-3.5" /> New segment
            </Button>
          )
        }
      />

      <Tabs value={tab} onValueChange={(v) => setTab(v as "audiences" | "campaigns")}>
        <TabsList>
          <TabsTrigger value="audiences">Audiences</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
        </TabsList>

        <TabsContent value="audiences" className="mt-4">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full rounded-xl" />
              ))}
            </div>
          ) : segments.length === 0 ? (
            <EmptyState icon={Users} title="No audience segments yet" description="Save a lead filter to build your first audience." className="border-none py-16" />
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {segments.map((segment) => (
                <div
                  key={segment.id}
                  className="group flex cursor-pointer flex-col rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40"
                  onClick={() => setPreviewSegment(segment)}
                >
                  <div className="mb-2 flex items-start justify-between">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                      <Users className="h-4 w-4" />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground opacity-0 hover:text-danger group-hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeletingSegment(segment);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <p className="text-sm font-medium text-foreground">{segment.name}</p>
                  {segment.description && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{segment.description}</p>}
                  <div className="mt-auto flex items-center justify-between pt-3">
                    <span className="text-lg font-semibold tabular-nums text-foreground">{segment.member_count ?? "—"}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingSegment(segment);
                        setFormOpen(true);
                      }}
                    >
                      Edit
                    </Button>
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground">Saved {formatDate(segment.created_at)}</p>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="campaigns" className="mt-4">
          <EmptyState
            icon={Megaphone}
            title="Campaigns are coming next"
            description="Send an audience a Meta-approved WhatsApp template. Audiences are ready — campaign sending is being built next."
            className="border-none py-16"
          />
        </TabsContent>
      </Tabs>

      <SegmentFormDialog
        segment={editingSegment}
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingSegment(null);
        }}
      />
      <SegmentPreviewDialog
        segmentId={previewSegment?.id ?? null}
        segmentName={previewSegment?.name}
        open={previewSegment !== null}
        onOpenChange={(open) => !open && setPreviewSegment(null)}
      />
      <ConfirmDialog
        open={deletingSegment !== null}
        onOpenChange={(open) => !open && setDeletingSegment(null)}
        title="Delete this segment?"
        description={`"${deletingSegment?.name}" will be removed. This can't be undone.`}
        confirmLabel="Delete"
        destructive
        isPending={deleteSegment.isPending}
        onConfirm={() => deletingSegment && deleteSegment.mutate(deletingSegment.id, { onSuccess: () => setDeletingSegment(null) })}
      />
    </div>
  );
}
