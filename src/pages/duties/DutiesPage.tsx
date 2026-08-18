import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { AlertTriangle, ListChecks, MoreHorizontal, Plus, Search } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/services/authStore";
import { canManageDuties } from "@/constants/permissions";
import { useDebounce } from "@/hooks/useDebounce";
import { useArchiveDuty, useDeleteDuty, useDuties, useMyDuties, usePublishDuty } from "@/modules/duties/hooks";
import { DutyFormDialog } from "@/modules/duties/DutyFormDialog";
import { DutyAcknowledgementDialog } from "@/modules/duties/DutyAcknowledgementDialog";
import type { Duty } from "@/modules/duties/types";
import { DutyStatus, DutyType } from "@/types/enums";
import { toTitleCase, formatDate } from "@/utils/format";

const TYPE_FILTERS: { label: string; value: DutyType | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Responsibilities", value: DutyType.ROLE_RESPONSIBILITY },
  { label: "Policies", value: DutyType.POLICY },
  { label: "SOPs", value: DutyType.SOP },
  { label: "Code of Conduct", value: DutyType.CODE_OF_CONDUCT },
];

export function DutiesPage() {
  const currentUser = useAuthStore((s) => s.user);
  const canManage = canManageDuties(currentUser?.role);
  const navigate = useNavigate();

  const [tab, setTab] = useState<"mine" | "manage">("mine");
  const [formOpen, setFormOpen] = useState(false);
  const [editingDuty, setEditingDuty] = useState<Duty | null>(null);
  const [ackDuty, setAckDuty] = useState<Duty | null>(null);
  const [archivingDuty, setArchivingDuty] = useState<Duty | null>(null);
  const [deletingDuty, setDeletingDuty] = useState<Duty | null>(null);

  return (
    <div>
      <PageHeader
        title="Duties & Responsibilities"
        description="Manage staff responsibilities, policies, guidelines, SOPs and code of conduct."
        actions={
          canManage && (
            <Button
              size="sm"
              onClick={() => {
                setEditingDuty(null);
                setFormOpen(true);
              }}
            >
              <Plus className="h-3.5 w-3.5" /> Create Duty
            </Button>
          )
        }
      />

      <Tabs value={tab} onValueChange={(v) => setTab(v as "mine" | "manage")}>
        <TabsList>
          <TabsTrigger value="mine">My Duties</TabsTrigger>
          <TabsTrigger value="manage">All Duties</TabsTrigger>
        </TabsList>
        <TabsContent value="mine" className="mt-4">
          <MyDutiesSection onOpen={(d) => navigate(`/duties/${d.id}`)} />
        </TabsContent>
        <TabsContent value="manage" className="mt-4">
          <ManageDutiesSection
            readOnly={!canManage}
            onView={(d) => navigate(`/duties/${d.id}`)}
            onEdit={(d) => {
              setEditingDuty(d);
              setFormOpen(true);
            }}
            onViewAcknowledgements={setAckDuty}
            onArchive={setArchivingDuty}
            onDelete={setDeletingDuty}
          />
        </TabsContent>
      </Tabs>

      {canManage && (
        <>
          <DutyFormDialog
            duty={editingDuty}
            open={formOpen}
            onOpenChange={(open) => {
              setFormOpen(open);
              if (!open) setEditingDuty(null);
            }}
          />
          <DutyAcknowledgementDialog
            dutyId={ackDuty?.id ?? null}
            dutyTitle={ackDuty?.title ?? undefined}
            open={ackDuty !== null}
            onOpenChange={(open) => !open && setAckDuty(null)}
          />
          <ArchiveConfirm duty={archivingDuty} onOpenChange={(open) => !open && setArchivingDuty(null)} />
          <DeleteConfirm duty={deletingDuty} onOpenChange={(open) => !open && setDeletingDuty(null)} />
        </>
      )}
    </div>
  );
}

function ArchiveConfirm({ duty, onOpenChange }: { duty: Duty | null; onOpenChange: (open: boolean) => void }) {
  const archive = useArchiveDuty();
  return (
    <ConfirmDialog
      open={duty !== null}
      onOpenChange={onOpenChange}
      title="Archive this duty?"
      description={`"${duty?.title}" will no longer be visible to staff. It stays in the record for audit purposes.`}
      confirmLabel="Archive"
      isPending={archive.isPending}
      onConfirm={() => duty && archive.mutate(duty.id, { onSuccess: () => onOpenChange(false) })}
    />
  );
}

function DeleteConfirm({ duty, onOpenChange }: { duty: Duty | null; onOpenChange: (open: boolean) => void }) {
  const deleteDuty = useDeleteDuty();
  return (
    <ConfirmDialog
      open={duty !== null}
      onOpenChange={onOpenChange}
      title="Delete this draft?"
      description={`"${duty?.title}" will be permanently removed. Only drafts can be deleted — published duties should be archived instead.`}
      confirmLabel="Delete"
      destructive
      isPending={deleteDuty.isPending}
      onConfirm={() => duty && deleteDuty.mutate(duty.id, { onSuccess: () => onOpenChange(false) })}
    />
  );
}

function MyDutiesSection({ onOpen }: { onOpen: (duty: Duty) => void }) {
  const { data, isLoading } = useMyDuties();
  const duties = data?.items ?? [];
  const pending = duties.filter((d) => d.requires_acknowledgement && !d.is_acknowledged_by_me);

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (duties.length === 0) {
    return <EmptyState icon={ListChecks} title="No duties assigned to you yet" className="border-none py-16" />;
  }

  return (
    <div className="space-y-4">
      {pending.length > 0 && (
        <div className="flex items-center gap-2.5 rounded-xl border border-warning/30 bg-warning/5 p-3.5">
          <AlertTriangle className="h-4 w-4 shrink-0 text-warning" />
          <p className="text-sm text-foreground">
            <span className="font-semibold">Action required</span> — {pending.length} {pending.length === 1 ? "item" : "items"} require your
            acknowledgement.
          </p>
        </div>
      )}

      <div className="space-y-2">
        {duties.map((duty) => (
          <button
            key={duty.id}
            onClick={() => onOpen(duty)}
            className="flex w-full items-center justify-between rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-primary/40"
          >
            <div>
              <p className="text-sm font-medium text-foreground">{duty.title}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {toTitleCase(duty.type)} · Version {duty.version}
              </p>
            </div>
            {duty.requires_acknowledgement && (
              <span
                className={
                  duty.is_acknowledged_by_me
                    ? "shrink-0 text-xs font-medium text-success"
                    : "shrink-0 rounded-full bg-warning/10 px-2.5 py-1 text-xs font-medium text-warning"
                }
              >
                {duty.is_acknowledged_by_me ? "Acknowledged ✓" : "Read & Acknowledge"}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

function ManageDutiesSection({
  readOnly,
  onView,
  onEdit,
  onViewAcknowledgements,
  onArchive,
  onDelete,
}: {
  readOnly: boolean;
  onView: (duty: Duty) => void;
  onEdit: (duty: Duty) => void;
  onViewAcknowledgements: (duty: Duty) => void;
  onArchive: (duty: Duty) => void;
  onDelete: (duty: Duty) => void;
}) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [typeFilter, setTypeFilter] = useState<DutyType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<DutyStatus | "all">("all");

  const { data, isLoading } = useDuties({
    limit: 60,
    search: debouncedSearch || undefined,
    type: typeFilter === "all" ? undefined : typeFilter,
    // Read-only viewers only ever get published duties back regardless of
    // this filter (the backend forces it) — hide the picker for them below.
    status: readOnly ? undefined : statusFilter === "all" ? undefined : statusFilter,
  });
  const publish = usePublishDuty();
  const duties = data?.items ?? [];

  const statusOptions = useMemo(() => ["all", ...Object.values(DutyStatus)] as const, []);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {TYPE_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setTypeFilter(f.value)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                typeFilter === f.value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        {!readOnly && (
          <div className="flex items-center gap-2">
            {statusOptions.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s as DutyStatus | "all")}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  statusFilter === s ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {s === "all" ? "All statuses" : toTitleCase(s)}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="relative mb-4 max-w-xs">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input className="pl-8" placeholder="Search duties…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : duties.length === 0 ? (
        <EmptyState icon={ListChecks} title="No duties match these filters" className="border-none py-16" />
      ) : (
        <div className="space-y-2">
          {duties.map((duty) => {
            const appliesTo = [...duty.job_roles.map((r) => r.name), ...duty.departments.map((d) => d.name), ...duty.users.map((u) => `${u.first_name} ${u.last_name}`)];
            return (
              <div
                key={duty.id}
                className={`rounded-xl border border-border bg-card p-4 ${readOnly ? "cursor-pointer transition-colors hover:border-primary/40" : ""}`}
                onClick={readOnly ? () => onView(duty) : undefined}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium text-foreground">{duty.title}</p>
                      {duty.priority !== "normal" && <StatusBadge status={duty.priority} />}
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">{toTitleCase(duty.type)}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <StatusBadge status={duty.status} />
                    {!readOnly && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onView(duty)}>View</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEdit(duty)}>Edit</DropdownMenuItem>
                          {duty.status !== DutyStatus.PUBLISHED && (
                            <DropdownMenuItem onClick={() => publish.mutate(duty.id)}>Publish</DropdownMenuItem>
                          )}
                          {duty.requires_acknowledgement && (
                            <DropdownMenuItem onClick={() => onViewAcknowledgements(duty)}>View acknowledgements</DropdownMenuItem>
                          )}
                          {duty.status !== DutyStatus.ARCHIVED && (
                            <DropdownMenuItem onClick={() => onArchive(duty)}>Archive</DropdownMenuItem>
                          )}
                          {duty.status === DutyStatus.DRAFT && (
                            <DropdownMenuItem onClick={() => onDelete(duty)} className="text-danger">
                              Delete
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>

                <p className="mt-2 text-xs text-muted-foreground">
                  Applies to: <span className="text-foreground">{appliesTo.length > 0 ? appliesTo.join(", ") : "Nobody yet"}</span>
                </p>

                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span>Version {duty.version}</span>
                  {duty.effective_from && <span>Effective {formatDate(duty.effective_from)}</span>}
                  {duty.requires_acknowledgement && duty.applicable_count !== null && (
                    <span>
                      {duty.acknowledged_count} / {duty.applicable_count} acknowledged
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
