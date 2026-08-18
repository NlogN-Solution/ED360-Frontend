import { useState } from "react";
import { Link, useParams } from "react-router";
import { ArrowLeft, Loader2, Plus, Printer, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useAddPayslipLineItem, usePayslip, useRemovePayslipLineItem } from "@/modules/payroll/hooks";
import { useOrganization } from "@/modules/subscription/hooks";
import { useStaffDirectory } from "@/modules/users/hooks";
import { useAuthStore } from "@/services/authStore";
import { canManagePayroll } from "@/constants/permissions";
import { PayrollRunStatus, PayslipLineItemCategory, PayslipLineType } from "@/types/enums";
import { formatCurrency, toTitleCase } from "@/utils/format";
import { resolveUploadUrl } from "@/utils/url";

export function PayslipPage() {
  const { payslipId } = useParams<{ payslipId: string }>();
  const { data: payslip, isLoading } = usePayslip(payslipId);
  const { data: organization } = useOrganization();
  const { data: employees } = useStaffDirectory({ user_id: payslip?.user_id, limit: 1 });
  const currentUser = useAuthStore((s) => s.user);

  const addItem = useAddPayslipLineItem(payslipId ?? "");
  const removeItem = useRemovePayslipLineItem(payslipId ?? "");

  const [showAddForm, setShowAddForm] = useState(false);
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<PayslipLineType>(PayslipLineType.DEDUCTION);
  const [category, setCategory] = useState<PayslipLineItemCategory>(PayslipLineItemCategory.OTHER);

  if (isLoading || !payslip) {
    return (
      <div className="mx-auto max-w-2xl space-y-3 px-6 py-5 print:hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  const employee = employees?.[0];
  const employeeName = employee ? `${employee.first_name} ${employee.last_name}` : "";
  const canManage = canManagePayroll(currentUser?.role) && payslip.run_status === PayrollRunStatus.DRAFT;
  const logoUrl = resolveUploadUrl(organization?.logo_url);
  const perDayRate = payslip.expected_work_days > 0 ? payslip.basic_salary / payslip.expected_work_days : 0;
  const grossPay = payslip.basic_salary + payslip.additions_total;
  const totalDeductions = payslip.attendance_deduction + payslip.deductions_total;
  const additionItems = payslip.line_items.filter((item) => item.type === PayslipLineType.ADDITION);
  const deductionItems = payslip.line_items.filter((item) => item.type === PayslipLineType.DEDUCTION);

  function handleAdd() {
    if (!label.trim() || !amount) return;
    addItem.mutate(
      { type, category, label: label.trim(), amount: Number(amount) },
      {
        onSuccess: () => {
          setShowAddForm(false);
          setLabel("");
          setAmount("");
        },
      },
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-5 print:max-w-full print:px-10 print:py-6">
      <div className="mb-4 flex items-center justify-between print:hidden">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/payroll">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Payroll
          </Link>
        </Button>
        <Button variant="outline" size="sm" onClick={() => window.print()}>
          <Printer className="h-3.5 w-3.5" /> Print / Save as PDF
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 print:rounded-none print:border-none print:p-0">
        <div className="mb-6 flex items-start justify-between border-b border-border pb-5">
          <div className="flex items-center gap-3">
            {logoUrl ? (
              <img src={logoUrl} alt={organization?.name ?? ""} className="h-10 w-10 shrink-0 rounded-md object-cover" />
            ) : null}
            <div>
              <p className="text-[15px] font-semibold tracking-tight text-foreground">{organization?.name ?? "Payslip"}</p>
              <p className="text-xs text-muted-foreground">Payslip for {payslip.run_period}</p>
            </div>
          </div>
          <div className="text-right">
            <StatusBadge status={payslip.run_status} />
            {employeeName && <p className="mt-1.5 text-sm font-medium text-foreground">{employeeName}</p>}
          </div>
        </div>

        <div className="mb-6 grid grid-cols-3 gap-3 rounded-lg bg-muted/50 p-3 text-sm">
          <div>
            <p className="text-[11px] text-muted-foreground">Present days</p>
            <p className="font-medium text-foreground">
              {payslip.present_days} / {payslip.expected_work_days}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">Paid leave</p>
            <p className="font-medium text-foreground">{payslip.paid_leave_days} day(s)</p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">Unpaid</p>
            <p className="font-medium text-foreground">{payslip.unpaid_days} day(s)</p>
          </div>
        </div>

        <div className="mb-4 space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Earnings</p>
          <div className="space-y-1.5 rounded-lg border border-border p-3">
            <Row label="Basic salary" amount={payslip.basic_salary} currency={payslip.currency} tone="neutral" />
            {additionItems.map((item) => (
              <Row
                key={item.id}
                label={item.label}
                sublabel={toTitleCase(item.category)}
                amount={item.amount}
                currency={payslip.currency}
                tone="positive"
                onRemove={canManage ? () => removeItem.mutate(item.id) : undefined}
                removePending={removeItem.isPending}
              />
            ))}
            <TotalRow label="Gross pay" amount={grossPay} currency={payslip.currency} />
          </div>
        </div>

        <div className="mb-4 space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Deductions</p>
          <div className="space-y-1.5 rounded-lg border border-border p-3">
            {payslip.attendance_deduction > 0 && (
              <Row
                label="Attendance deduction"
                sublabel={`${payslip.unpaid_days} unpaid day(s) × ${formatCurrency(perDayRate, payslip.currency)}/day`}
                amount={payslip.attendance_deduction}
                currency={payslip.currency}
                tone="negative"
              />
            )}
            {deductionItems.map((item) => (
              <Row
                key={item.id}
                label={item.label}
                sublabel={toTitleCase(item.category)}
                amount={item.amount}
                currency={payslip.currency}
                tone="negative"
                onRemove={canManage ? () => removeItem.mutate(item.id) : undefined}
                removePending={removeItem.isPending}
              />
            ))}
            {payslip.attendance_deduction === 0 && deductionItems.length === 0 && (
              <p className="text-sm text-muted-foreground">No deductions this period.</p>
            )}
            <TotalRow label="Total deductions" amount={totalDeductions} currency={payslip.currency} />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg bg-primary/5 px-4 py-3.5">
          <span className="text-sm font-semibold text-foreground">Net pay</span>
          <span className="text-xl font-semibold tabular-nums text-foreground">{formatCurrency(payslip.net_pay, payslip.currency)}</span>
        </div>

        {canManage && (
          <div className="mt-4 print:hidden">
            {showAddForm ? (
              <div className="space-y-2 rounded-lg border border-dashed border-border p-3">
                <div className="grid grid-cols-3 gap-2">
                  <Select value={type} onValueChange={(v) => setType(v as PayslipLineType)}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={PayslipLineType.ADDITION}>Addition</SelectItem>
                      <SelectItem value={PayslipLineType.DEDUCTION}>Deduction</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={category} onValueChange={(v) => setCategory(v as PayslipLineItemCategory)}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={PayslipLineItemCategory.TAX}>Tax</SelectItem>
                      <SelectItem value={PayslipLineItemCategory.PROVIDENT_FUND}>Provident Fund</SelectItem>
                      <SelectItem value={PayslipLineItemCategory.BONUS}>Bonus</SelectItem>
                      <SelectItem value={PayslipLineItemCategory.ALLOWANCE}>Allowance</SelectItem>
                      <SelectItem value={PayslipLineItemCategory.OTHER}>Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input type="number" min={0} placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
                </div>
                <Input placeholder="Label (e.g. Performance bonus)" value={label} onChange={(e) => setLabel(e.target.value)} />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </Button>
                  <Button size="sm" disabled={!label.trim() || !amount || addItem.isPending} onClick={handleAdd}>
                    {addItem.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    Add
                  </Button>
                </div>
              </div>
            ) : (
              <Button variant="outline" size="sm" className="w-full" onClick={() => setShowAddForm(true)}>
                <Plus className="h-3.5 w-3.5" /> Add line item
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Row({
  label,
  sublabel,
  amount,
  currency,
  tone,
  onRemove,
  removePending,
}: {
  label: string;
  sublabel?: string;
  amount: number;
  currency: string;
  tone: "neutral" | "positive" | "negative";
  onRemove?: () => void;
  removePending?: boolean;
}) {
  const amountClass = tone === "positive" ? "text-success" : tone === "negative" ? "text-danger" : "text-foreground";
  const sign = tone === "positive" ? "+" : tone === "negative" ? "-" : "";
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="flex min-w-0 items-center gap-1.5">
        <span className="truncate text-foreground">{label}</span>
        {sublabel && <span className="shrink-0 text-xs text-muted-foreground">({sublabel})</span>}
        {onRemove && (
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 shrink-0 text-muted-foreground hover:text-danger print:hidden"
            disabled={removePending}
            onClick={onRemove}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </span>
      <span className={`shrink-0 tabular-nums ${amountClass}`}>
        {sign}
        {formatCurrency(amount, currency)}
      </span>
    </div>
  );
}

function TotalRow({ label, amount, currency }: { label: string; amount: number; currency: string }) {
  return (
    <div className="flex items-center justify-between border-t border-border pt-2 text-sm font-semibold">
      <span className="text-foreground">{label}</span>
      <span className="tabular-nums text-foreground">{formatCurrency(amount, currency)}</span>
    </div>
  );
}
