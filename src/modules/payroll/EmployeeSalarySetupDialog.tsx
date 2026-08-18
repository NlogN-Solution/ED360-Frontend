import { useState } from "react";
import { Loader2, Plus, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useCreateRecurringLineItem, useDeactivateRecurringLineItem, useRecurringLineItems, useSalaryStructure } from "./hooks";
import { SalaryStructureForm } from "./SalaryStructureForm";
import { PayslipLineItemCategory, PayslipLineType } from "@/types/enums";
import { formatNumber, toTitleCase } from "@/utils/format";

export function EmployeeSalarySetupDialog({
  employee,
  open,
  onOpenChange,
}: {
  employee: { id: string; name: string } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{employee ? `${employee.name} — Salary setup` : "Salary setup"}</DialogTitle>
        </DialogHeader>
        {employee && (
          <div className="space-y-5">
            <SalaryStructureSection userId={employee.id} />
            <RecurringItemsSection userId={employee.id} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function SalaryStructureSection({ userId }: { userId: string }) {
  const { data: structure, isLoading } = useSalaryStructure(userId);

  if (isLoading) return <Skeleton className="h-40 w-full rounded-lg" />;

  return <SalaryStructureForm userId={userId} structure={structure ?? null} />;
}

function RecurringItemsSection({ userId }: { userId: string }) {
  const { data: items, isLoading } = useRecurringLineItems(userId);
  const create = useCreateRecurringLineItem(userId);
  const deactivate = useDeactivateRecurringLineItem(userId);

  const [showAddForm, setShowAddForm] = useState(false);
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<PayslipLineType>(PayslipLineType.DEDUCTION);
  const [category, setCategory] = useState<PayslipLineItemCategory>(PayslipLineItemCategory.OTHER);

  const activeItems = (items ?? []).filter((item) => item.is_active);

  function handleAdd() {
    if (!label.trim() || !amount) return;
    create.mutate(
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
    <div>
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        Recurring items <span className="normal-case text-muted-foreground/70">— applied to every future run</span>
      </p>
      <div className="space-y-1.5 rounded-lg border border-border p-3">
        {isLoading ? (
          <Skeleton className="h-8 w-full" />
        ) : activeItems.length === 0 ? (
          <p className="text-sm text-muted-foreground">No recurring items — e.g. tax, provident fund, or a standing allowance.</p>
        ) : (
          activeItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5">
                <span className="text-foreground">{item.label}</span>
                <span className="text-xs text-muted-foreground">({toTitleCase(item.category)})</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className={item.type === PayslipLineType.DEDUCTION ? "text-danger" : "text-success"}>
                  {item.type === PayslipLineType.DEDUCTION ? "-" : "+"}
                  {formatNumber(item.amount)}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 text-muted-foreground hover:text-danger"
                  disabled={deactivate.isPending}
                  onClick={() => deactivate.mutate(item.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </span>
            </div>
          ))
        )}

        {showAddForm ? (
          <div className="space-y-2 border-t border-border pt-2">
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
            <Input placeholder="Label (e.g. Provident Fund)" value={label} onChange={(e) => setLabel(e.target.value)} />
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
              <Button size="sm" disabled={!label.trim() || !amount || create.isPending} onClick={handleAdd}>
                {create.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Add
              </Button>
            </div>
          </div>
        ) : (
          <Button variant="outline" size="sm" className="w-full" onClick={() => setShowAddForm(true)}>
            <Plus className="h-3.5 w-3.5" /> Add recurring item
          </Button>
        )}
      </div>
    </div>
  );
}
