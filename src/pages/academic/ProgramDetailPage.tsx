import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Building2, CalendarRange, FileText, GraduationCap, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useBreadcrumbStore } from "@/hooks/useBreadcrumbStore";
import { useAuthStore } from "@/services/authStore";
import { useIntakes, useProgram, useUniversity } from "@/modules/academic/hooks";
import { useApplications } from "@/modules/applications/hooks";
import { StudentNameCell } from "@/modules/users/StudentNameCell";
import { ProgramEditDialog } from "@/modules/academic/ProgramEditDialog";
import { UserRole } from "@/types/enums";
import { formatCurrency, formatDate, toTitleCase } from "@/utils/format";

export function ProgramDetailPage() {
  const { programId } = useParams();
  const navigate = useNavigate();
  const setLabel = useBreadcrumbStore((s) => s.setLabel);
  const role = useAuthStore((s) => s.user?.role);
  const canEdit = role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN;
  const [editOpen, setEditOpen] = useState(false);

  const { data: program, isLoading } = useProgram(programId);
  const { data: university } = useUniversity(program?.university_id);
  const { data: intakes, isLoading: intakesLoading } = useIntakes({ program_id: programId, limit: 100 });
  const { data: applications } = useApplications({ program_id: programId, limit: 5 });

  useEffect(() => {
    if (program) setLabel(program.name);
  }, [program, setLabel]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32" />
      </div>
    );
  }

  if (!program) {
    return <EmptyState icon={GraduationCap} title="Course not found" description="It may have been removed." />;
  }

  return (
    <div>
      <Button variant="ghost" size="sm" className="mb-3 -ml-2 gap-1.5 text-muted-foreground" onClick={() => navigate("/academic/programs")}>
        <ArrowLeft className="h-3.5 w-3.5" /> Back to courses
      </Button>

      <div className="mb-5 flex flex-wrap items-start justify-between gap-3 rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-3.5">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <GraduationCap className="h-5 w-5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[19px] font-semibold tracking-tight text-foreground">{program.name}</h1>
              {program.degree_level && <Badge variant="secondary">{toTitleCase(program.degree_level)}</Badge>}
              {!program.is_active && <Badge variant="outline">Inactive</Badge>}
            </div>
            <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
              <Building2 className="h-3.5 w-3.5" />
              {university ? (
                <button className="hover:text-foreground hover:underline" onClick={() => navigate(`/academic/universities/${university.id}`)}>
                  {university.name}
                </button>
              ) : (
                "…"
              )}
            </p>
          </div>
        </div>
        {canEdit && (
          <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
            <Pencil className="h-3.5 w-3.5" /> Edit
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-xl border border-border bg-card p-4">
            <h2 className="mb-3 text-[13px] font-semibold text-foreground">Details</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <Field label="Field of study" value={program.field_of_study} />
              <Field label="Duration" value={program.duration_months ? `${program.duration_months} months` : null} />
              <Field label="Tuition fee" value={program.tuition_fee ? formatCurrency(program.tuition_fee, program.currency ?? undefined) : null} />
              <Field label="Minimum GPA" value={program.minimum_gpa ? String(program.minimum_gpa) : null} />
              <Field label="Minimum IELTS" value={program.minimum_ielts ? String(program.minimum_ielts) : null} />
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-4">
            <h2 className="mb-3 text-[13px] font-semibold text-foreground">Intakes</h2>
            {intakesLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-11 w-full" />
                ))}
              </div>
            ) : !intakes || intakes.items.length === 0 ? (
              <EmptyState icon={CalendarRange} title="No intakes yet" description="Add an intake for this course from the Academic data page." className="border-none py-8" />
            ) : (
              <div className="divide-y divide-border">
                {intakes.items.map((i) => (
                  <div key={i.id} className="flex items-center justify-between gap-3 py-2.5">
                    <span className="text-sm font-medium text-foreground">{i.name}</span>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {i.start_date && <span>Starts {formatDate(i.start_date)}</span>}
                      {i.application_deadline && <span>Deadline {formatDate(i.application_deadline)}</span>}
                      {!i.is_active && <Badge variant="outline">Inactive</Badge>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[13px] font-semibold text-foreground">Recent applications</h2>
            {applications && <span className="text-xs tabular-nums text-muted-foreground">{applications.total}</span>}
          </div>
          {!applications || applications.items.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No applications yet.</p>
          ) : (
            <div className="divide-y divide-border">
              {applications.items.map((app) => (
                <button
                  key={app.id}
                  onClick={() => navigate(`/applications/${app.id}`)}
                  className="flex w-full items-center justify-between gap-2 py-2.5 text-left transition-colors hover:bg-muted/30"
                >
                  <span className="flex items-center gap-2 text-sm text-foreground">
                    <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <StudentNameCell userId={app.student_id} />
                  </span>
                  <StatusBadge status={app.status} />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <ProgramEditDialog program={program} open={editOpen} onOpenChange={setEditOpen} />
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="text-foreground">{value ?? "—"}</p>
    </div>
  );
}
