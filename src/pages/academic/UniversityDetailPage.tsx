import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Building2, FileText, GraduationCap, Mail, MapPin, Pencil, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useBreadcrumbStore } from "@/hooks/useBreadcrumbStore";
import { useAuthStore } from "@/services/authStore";
import { useCountry, usePrograms, useUniversity } from "@/modules/academic/hooks";
import { useApplications } from "@/modules/applications/hooks";
import { StudentNameCell } from "@/modules/users/StudentNameCell";
import { UniversityEditDialog } from "@/modules/academic/UniversityEditDialog";
import { UserRole } from "@/types/enums";
import { toTitleCase } from "@/utils/format";

export function UniversityDetailPage() {
  const { universityId } = useParams();
  const navigate = useNavigate();
  const setLabel = useBreadcrumbStore((s) => s.setLabel);
  const role = useAuthStore((s) => s.user?.role);
  const canEdit = role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN;
  const [editOpen, setEditOpen] = useState(false);

  const { data: university, isLoading } = useUniversity(universityId);
  const { data: country } = useCountry(university?.country_id);
  const { data: programs, isLoading: programsLoading } = usePrograms({ university_id: universityId, limit: 100 });
  const { data: applications } = useApplications({ university_id: universityId, limit: 5 });

  useEffect(() => {
    if (university) setLabel(university.name);
  }, [university, setLabel]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32" />
      </div>
    );
  }

  if (!university) {
    return <EmptyState icon={Building2} title="University not found" description="It may have been removed." />;
  }

  return (
    <div>
      <Button variant="ghost" size="sm" className="mb-3 -ml-2 gap-1.5 text-muted-foreground" onClick={() => navigate("/academic/universities")}>
        <ArrowLeft className="h-3.5 w-3.5" /> Back to universities
      </Button>

      <div className="mb-5 flex flex-wrap items-start justify-between gap-3 rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-3.5">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Building2 className="h-5 w-5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[19px] font-semibold tracking-tight text-foreground">{university.name}</h1>
              {university.is_partner && <Badge>Partner</Badge>}
              {!university.is_active && <Badge variant="outline">Inactive</Badge>}
            </div>
            <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              {country ? (
                <button className="hover:text-foreground hover:underline" onClick={() => navigate(`/academic/countries/${country.id}`)}>
                  {country.name}
                </button>
              ) : (
                "…"
              )}
              {university.city && ` • ${university.city}`}
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
              <Field label="Short name" value={university.short_name} />
              <Field label="Ranking" value={university.ranking ? `#${university.ranking}` : null} />
              <Field
                label="Website"
                value={
                  university.website ? (
                    <a href={university.website} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                      {university.website}
                    </a>
                  ) : null
                }
              />
              <Field label="Address" value={university.address} />
              <Field label="Email" icon={Mail} value={university.email} />
              <Field label="Phone" icon={Phone} value={university.phone} />
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[13px] font-semibold text-foreground">Courses</h2>
              {programs && <span className="text-xs tabular-nums text-muted-foreground">{programs.total}</span>}
            </div>
            {programsLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-11 w-full" />
                ))}
              </div>
            ) : !programs || programs.items.length === 0 ? (
              <EmptyState icon={GraduationCap} title="No courses yet" description="Add a course for this university from the Academic data page." className="border-none py-8" />
            ) : (
              <div className="divide-y divide-border">
                {programs.items.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => navigate(`/academic/programs/${p.id}`)}
                    className="flex w-full items-center justify-between gap-3 py-2.5 text-left transition-colors hover:bg-muted/30"
                  >
                    <span className="text-sm font-medium text-foreground">{p.name}</span>
                    {p.degree_level && <Badge variant="secondary">{toTitleCase(p.degree_level)}</Badge>}
                  </button>
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

      <UniversityEditDialog university={university} open={editOpen} onOpenChange={setEditOpen} />
    </div>
  );
}

function Field({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value?: React.ReactNode;
  icon?: React.ElementType;
}) {
  return (
    <div>
      <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
        {Icon && <Icon className="h-3 w-3" />}
        {label}
      </p>
      <p className="text-foreground">{value ?? "—"}</p>
    </div>
  );
}
