import { useState } from "react";
import { useNavigate } from "react-router";
import type { ColumnDef } from "@tanstack/react-table";
import { Loader2, Receipt } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/shared/DataTable";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { StaffDirectoryNameCell } from "@/modules/users/StaffDirectoryNameCell";
import { useFinalizePayrollRun, useMarkPayrollRunPaid, usePayrollRun, useRunPayslips } from "./hooks";
import { monthLabel } from "./utils";
import type { Payslip } from "./types";
import { PayrollRunStatus } from "@/types/enums";
import { formatCurrency } from "@/utils/format";

export function PayrollRunDetailDialog({
  runId,
  open,
  onOpenChange,
  canManage,
}: {
  runId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canManage: boolean;
}) {
  const navigate = useNavigate();
  const { data: run } = usePayrollRun(runId ?? undefined);
  const { data: payslips, isLoading } = useRunPayslips(runId ?? undefined);
  const finalize = useFinalizePayrollRun();
  const markPaid = useMarkPayrollRunPaid();
  const [confirmAction, setConfirmAction] = useState<"finalize" | "mark-paid" | null>(null);

  const columns: ColumnDef<Payslip, any>[] = [
    { accessorKey: "user_id", header: "Employee", cell: ({ getValue }) => <StaffDirectoryNameCell userId={getValue<string>()} /> },
    { accessorKey: "present_days", header: "Present", cell: ({ getValue }) => <span className="tabular-nums">{getValue<number>()}</span> },
    {
      accessorKey: "paid_leave_days",
      header: "Paid leave",
      cell: ({ getValue }) => <span className="tabular-nums">{getValue<number>()}</span>,
    },
    { accessorKey: "unpaid_days", header: "Unpaid", cell: ({ getValue }) => <span className="tabular-nums">{getValue<number>()}</span> },
    {
      accessorKey: "net_pay",
      header: "Net pay",
      cell: ({ row }) => <span className="tabular-nums">{formatCurrency(row.original.net_pay, row.original.currency)}</span>,
    },
  ];

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{run ? monthLabel(run.period_year, run.period_month) : "Payroll run"}</DialogTitle>
          </DialogHeader>

          {run && (
            <div className="mb-1 flex items-center justify-between">
              <StatusBadge status={run.status} />
              {canManage && (
                <div className="flex items-center gap-2">
                  {run.status === PayrollRunStatus.DRAFT && (
                    <Button size="sm" disabled={finalize.isPending} onClick={() => setConfirmAction("finalize")}>
                      {finalize.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                      Finalize
                    </Button>
                  )}
                  {run.status === PayrollRunStatus.FINALIZED && (
                    <Button size="sm" disabled={markPaid.isPending} onClick={() => setConfirmAction("mark-paid")}>
                      {markPaid.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                      Mark paid
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}

          <DataTable
            columns={columns}
            data={payslips?.items ?? []}
            isLoading={isLoading}
            getRowId={(row) => row.id}
            onRowClick={(row) => navigate(`/payroll/payslips/${row.id}`)}
            emptyState={<EmptyState icon={Receipt} title="No payslips in this run" className="border-none py-10" />}
          />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmAction === "finalize"}
        onOpenChange={(next) => !next && setConfirmAction(null)}
        title="Finalize this payroll run?"
        description="Once finalized, line items can no longer be added or removed from these payslips. This can't be undone."
        confirmLabel="Finalize"
        isPending={finalize.isPending}
        onConfirm={() => run && finalize.mutate(run.id, { onSuccess: () => setConfirmAction(null) })}
      />
      <ConfirmDialog
        open={confirmAction === "mark-paid"}
        onOpenChange={(next) => !next && setConfirmAction(null)}
        title="Mark this payroll run as paid?"
        description="This confirms every payslip in this run has been paid out. This can't be undone."
        confirmLabel="Mark paid"
        isPending={markPaid.isPending}
        onConfirm={() => run && markPaid.mutate(run.id, { onSuccess: () => setConfirmAction(null) })}
      />
    </>
  );
}
