import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Ban, Building, CheckCircle2, Loader2, Sparkles, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { usePlatformOrganization, useUpdateOrganizationStatus, useOverridePlan } from "@/modules/platform/hooks";
import type { OrgSubscriptionPlan } from "@/modules/subscription/types";
import { formatCurrency, formatDate, formatDateTime, toTitleCase } from "@/utils/format";

const PLAN_LABELS: Record<string, string> = {
  starter: "Starter",
  professional: "Professional",
  enterprise: "Enterprise",
};

function OverridePlanDialog({
  open,
  onOpenChange,
  organizationId,
  currentPlan,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
  currentPlan: OrgSubscriptionPlan;
}) {
  const [plan, setPlan] = useState<OrgSubscriptionPlan>(currentPlan);
  const overridePlan = useOverridePlan(organizationId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Override plan</DialogTitle>
          <DialogDescription>Directly change this organization's plan — no charge is made.</DialogDescription>
        </DialogHeader>
        <Select value={plan} onValueChange={(v) => setPlan(v as OrgSubscriptionPlan)}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(PLAN_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={overridePlan.isPending}
            onClick={() => overridePlan.mutate({ plan }, { onSuccess: () => onOpenChange(false) })}
          >
            {overridePlan.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function PlatformOrganizationDetailPage() {
  const { organizationId } = useParams();
  const navigate = useNavigate();
  const [planDialogOpen, setPlanDialogOpen] = useState(false);
  const { data, isLoading } = usePlatformOrganization(organizationId);
  const updateStatus = useUpdateOrganizationStatus(organizationId ?? "");

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data) {
    return <EmptyState icon={Building} title="Organization not found" description="It may have been removed." />;
  }

  const { organization, subscription, billing_events } = data;

  return (
    <div>
      <Button variant="ghost" size="sm" className="mb-3 -ml-2 gap-1.5 text-muted-foreground" onClick={() => navigate("/platform/organizations")}>
        <ArrowLeft className="h-3.5 w-3.5" /> Back to organizations
      </Button>

      <div className="mb-5 flex flex-wrap items-start justify-between gap-4 rounded-xl border border-border bg-card p-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold text-foreground">{organization.name}</h1>
            <StatusBadge status={organization.status} />
          </div>
          <p className="text-sm text-muted-foreground">{organization.slug}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setPlanDialogOpen(true)}>
            <Sparkles className="h-3.5 w-3.5" /> Override plan
          </Button>
          {organization.status === "suspended" ? (
            <Button size="sm" onClick={() => updateStatus.mutate({ status: "active" })}>
              <CheckCircle2 className="h-3.5 w-3.5" /> Reactivate
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={() => updateStatus.mutate({ status: "suspended" })}>
              <Ban className="h-3.5 w-3.5" /> Suspend
            </Button>
          )}
          {organization.status !== "cancelled" && (
            <Button
              variant="outline"
              size="sm"
              className="text-danger hover:text-danger"
              onClick={() => {
                if (confirm(`Cancel ${organization.name}'s subscription?`)) updateStatus.mutate({ status: "cancelled" });
              }}
            >
              <XCircle className="h-3.5 w-3.5" /> Cancel
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Subscription</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {subscription ? (
              <>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-semibold text-foreground">{PLAN_LABELS[subscription.plan]}</span>
                  <span className="text-sm text-muted-foreground">
                    {formatCurrency(subscription.price)} / {subscription.billing_cycle === "monthly" ? "mo" : "yr"}
                  </span>
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>
                    Staff seats: {organization.usage.staff_used}{" "}
                    {organization.usage.staff_limit !== null ? `/ ${organization.usage.staff_limit}` : "(unlimited)"}
                  </p>
                  <p>
                    Students: {organization.usage.student_used}{" "}
                    {organization.usage.student_limit !== null ? `/ ${organization.usage.student_limit}` : "(unlimited)"}
                  </p>
                  {subscription.renewal_date && <p>Renews {formatDate(subscription.renewal_date)}</p>}
                  {subscription.trial_end_date && <p>Trial ends {formatDate(subscription.trial_end_date)}</p>}
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No subscription on file.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Billing history</CardTitle>
          </CardHeader>
          <CardContent>
            {billing_events.length === 0 ? (
              <p className="text-sm text-muted-foreground">No billing events yet.</p>
            ) : (
              <div className="space-y-2">
                {billing_events.map((event) => (
                  <div key={event.id} className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium text-foreground">{toTitleCase(event.event_type)}</p>
                      <p className="text-xs text-muted-foreground">{event.description ?? formatDateTime(event.created_at)}</p>
                    </div>
                    <div className="text-right">
                      <p className="tabular-nums font-medium text-foreground">{formatCurrency(event.amount)}</p>
                      <Badge variant={event.status === "succeeded" ? "default" : "destructive"} className="text-[10px]">
                        {toTitleCase(event.status)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {subscription && (
        <OverridePlanDialog
          open={planDialogOpen}
          onOpenChange={setPlanDialogOpen}
          organizationId={organization.id}
          currentPlan={subscription.plan}
        />
      )}
    </div>
  );
}
