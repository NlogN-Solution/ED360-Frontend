import { useState } from "react";
import { Loader2, Plus, Sparkles, Users, GraduationCap, HardDrive } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useChangePlan, useOrganization, useOrganizationSubscription, usePurchaseSeats } from "@/modules/subscription/hooks";
import type { CardDetails, OrgSubscriptionPlan } from "@/modules/subscription/types";
import { formatCurrency, formatDate } from "@/utils/format";
import { toTitleCase } from "@/utils/format";

const PLAN_LABELS: Record<OrgSubscriptionPlan, string> = {
  starter: "Starter",
  professional: "Professional",
  enterprise: "Enterprise",
};

function usagePercent(used: number, limit: number | null): number {
  if (limit === null || limit === 0) return 0;
  return Math.min(100, Math.round((used / limit) * 100));
}

function UsageMeter({
  icon: Icon,
  label,
  used,
  limit,
}: {
  icon: typeof Users;
  label: string;
  used: number;
  limit: number | null;
}) {
  const percent = usagePercent(used, limit);
  const nearLimit = limit !== null && percent >= 90;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-1.5 font-medium text-foreground">
          <Icon className="h-3.5 w-3.5 text-muted-foreground" />
          {label}
        </span>
        <span className="tabular-nums text-muted-foreground">
          {used} {limit !== null ? `/ ${limit}` : "(unlimited)"}
        </span>
      </div>
      {limit !== null && (
        <Progress value={percent} className={nearLimit ? "[&>div]:bg-destructive" : undefined} />
      )}
    </div>
  );
}

const EMPTY_CARD: CardDetails = { card_number: "", expiry: "", cvv: "" };

function CardFields({ card, onChange }: { card: CardDetails; onChange: (card: CardDetails) => void }) {
  return (
    <div className="space-y-1.5">
      <Label>Card details (mock — a number ending in 0000 declines)</Label>
      <Input
        placeholder="4242 4242 4242 4242"
        value={card.card_number}
        onChange={(e) => onChange({ ...card, card_number: e.target.value })}
      />
      <div className="flex gap-2">
        <Input placeholder="MM/YY" value={card.expiry} onChange={(e) => onChange({ ...card, expiry: e.target.value })} />
        <Input placeholder="CVV" value={card.cvv} onChange={(e) => onChange({ ...card, cvv: e.target.value })} />
      </div>
    </div>
  );
}

function PurchaseSeatsDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [seats, setSeats] = useState("5");
  const [card, setCard] = useState<CardDetails>(EMPTY_CARD);
  const purchaseSeats = usePurchaseSeats();

  function handleSubmit() {
    const additional = Number(seats);
    if (!Number.isFinite(additional) || additional <= 0) return;
    purchaseSeats.mutate(
      { additional_seats: additional, card },
      { onSuccess: () => onOpenChange(false) },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Purchase extra seats</DialogTitle>
          <DialogDescription>Add more staff seats to your current plan.</DialogDescription>
        </DialogHeader>
        <div className="space-y-1.5">
          <Label>Additional seats</Label>
          <Input type="number" min={1} value={seats} onChange={(e) => setSeats(e.target.value)} />
        </div>
        <CardFields card={card} onChange={setCard} />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={purchaseSeats.isPending} onClick={handleSubmit}>
            {purchaseSeats.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Purchase
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ChangePlanDialog({
  open,
  onOpenChange,
  currentPlan,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPlan: OrgSubscriptionPlan;
}) {
  const [plan, setPlan] = useState<OrgSubscriptionPlan>(currentPlan);
  const [card, setCard] = useState<CardDetails>(EMPTY_CARD);
  const changePlan = useChangePlan();

  function handleSubmit() {
    changePlan.mutate({ plan, card }, { onSuccess: () => onOpenChange(false) });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Change plan</DialogTitle>
          <DialogDescription>Switch your organization to a different plan.</DialogDescription>
        </DialogHeader>
        <div className="space-y-1.5">
          <Label>Plan</Label>
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
        </div>
        <CardFields card={card} onChange={setCard} />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={changePlan.isPending} onClick={handleSubmit}>
            {changePlan.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function SubscriptionPage() {
  const { data: organization } = useOrganization();
  const { data: subscription, isLoading } = useOrganizationSubscription();
  const [purchaseOpen, setPurchaseOpen] = useState(false);
  const [planOpen, setPlanOpen] = useState(false);

  if (isLoading || !subscription) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const staffLimit = subscription.included_staff_seats === null
    ? null
    : subscription.included_staff_seats + subscription.extra_staff_seats;

  return (
    <div>
      <PageHeader
        title="Subscription"
        description={organization ? `Plan and usage for ${organization.name}` : "Plan and usage"}
        actions={
          <>
            <Button variant="outline" onClick={() => setPurchaseOpen(true)}>
              <Plus className="h-4 w-4" />
              Purchase seats
            </Button>
            <Button onClick={() => setPlanOpen(true)}>
              <Sparkles className="h-4 w-4" />
              Upgrade plan
            </Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Current plan</CardTitle>
            <Badge variant={subscription.status === "active" ? "default" : "secondary"}>
              {toTitleCase(subscription.status)}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-foreground">{PLAN_LABELS[subscription.plan]}</span>
              <span className="text-sm text-muted-foreground">
                {formatCurrency(subscription.price)} / {subscription.billing_cycle === "monthly" ? "mo" : "yr"}
              </span>
            </div>
            <div className="space-y-1 text-sm text-muted-foreground">
              {subscription.renewal_date && <p>Renews {formatDate(subscription.renewal_date)}</p>}
              {subscription.trial_end_date && <p>Trial ends {formatDate(subscription.trial_end_date)}</p>}
              {subscription.extra_staff_seats > 0 && <p>{subscription.extra_staff_seats} extra seat(s) purchased</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Usage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <UsageMeter icon={Users} label="Staff seats" used={subscription.usage.staff_used} limit={staffLimit} />
            <UsageMeter
              icon={GraduationCap}
              label="Student accounts"
              used={subscription.usage.student_used}
              limit={subscription.student_limit}
            />
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5 font-medium text-foreground">
                <HardDrive className="h-3.5 w-3.5 text-muted-foreground" />
                Storage
              </span>
              <span className="text-muted-foreground">
                {subscription.storage_limit_mb === null
                  ? "Unlimited"
                  : `${(subscription.storage_limit_mb / 1024).toFixed(1)} GB included`}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <PurchaseSeatsDialog open={purchaseOpen} onOpenChange={setPurchaseOpen} />
      <ChangePlanDialog open={planOpen} onOpenChange={setPlanOpen} currentPlan={subscription.plan} />
    </div>
  );
}
