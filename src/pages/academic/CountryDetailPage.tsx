import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Building2, Globe2, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { useBreadcrumbStore } from "@/hooks/useBreadcrumbStore";
import { useAuthStore } from "@/services/authStore";
import { useCountry, useUniversities } from "@/modules/academic/hooks";
import { CountryEditDialog } from "@/modules/academic/CountryEditDialog";
import { UserRole } from "@/types/enums";

export function CountryDetailPage() {
  const { countryId } = useParams();
  const navigate = useNavigate();
  const setLabel = useBreadcrumbStore((s) => s.setLabel);
  const role = useAuthStore((s) => s.user?.role);
  const canEdit = role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN;
  const [editOpen, setEditOpen] = useState(false);

  const { data: country, isLoading } = useCountry(countryId);
  const { data: universities, isLoading: universitiesLoading } = useUniversities({ country_id: countryId, limit: 100 });

  useEffect(() => {
    if (country) setLabel(country.name);
  }, [country, setLabel]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32" />
      </div>
    );
  }

  if (!country) {
    return <EmptyState icon={Globe2} title="Country not found" description="It may have been removed." />;
  }

  return (
    <div>
      <Button variant="ghost" size="sm" className="mb-3 -ml-2 gap-1.5 text-muted-foreground" onClick={() => navigate("/academic/countries")}>
        <ArrowLeft className="h-3.5 w-3.5" /> Back to countries
      </Button>

      <div className="mb-5 flex flex-wrap items-start justify-between gap-3 rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-3.5">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Globe2 className="h-5 w-5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[19px] font-semibold tracking-tight text-foreground">{country.name}</h1>
              <Badge variant="secondary">{country.iso2}</Badge>
              {!country.is_active && <Badge variant="outline">Inactive</Badge>}
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {universities?.total ?? 0} {universities?.total === 1 ? "university" : "universities"} on file
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
        <div className="rounded-xl border border-border bg-card p-4">
          <h2 className="mb-3 text-[13px] font-semibold text-foreground">Details</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <Field label="ISO2" value={country.iso2} />
            <Field label="ISO3" value={country.iso3} />
            <Field label="Phone code" value={country.phone_code} />
            <Field label="Currency" value={country.currency_code} />
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 lg:col-span-2">
          <h2 className="mb-3 text-[13px] font-semibold text-foreground">Universities</h2>
          {universitiesLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-11 w-full" />
              ))}
            </div>
          ) : !universities || universities.items.length === 0 ? (
            <EmptyState icon={Building2} title="No universities yet" description="Add a university for this country from the Academic data page." className="border-none py-8" />
          ) : (
            <div className="divide-y divide-border">
              {universities.items.map((u) => (
                <button
                  key={u.id}
                  onClick={() => navigate(`/academic/universities/${u.id}`)}
                  className="flex w-full items-center justify-between gap-3 py-2.5 text-left transition-colors hover:bg-muted/30"
                >
                  <div className="flex items-center gap-2.5">
                    <Building2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">{u.name}</span>
                    {u.city && <span className="text-xs text-muted-foreground">{u.city}</span>}
                  </div>
                  {u.is_partner && <Badge>Partner</Badge>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <CountryEditDialog country={country} open={editOpen} onOpenChange={setEditOpen} />
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
