import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/constants/queryKeys";
import { getErrorMessage } from "@/utils/errors";
import {
  payrollRunService,
  payslipService,
  recurringLineItemService,
  salaryStructureService,
  type PayrollRunListParams,
} from "./service";
import type {
  PayslipLineItemCreatePayload,
  RecurringLineItemCreatePayload,
  RecurringLineItemUpdatePayload,
  SalaryStructureUpsertPayload,
} from "./types";

export function useSalaryStructure(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.salaryStructure.detail(userId ?? ""),
    queryFn: () => salaryStructureService.get(userId as string),
    enabled: Boolean(userId),
  });
}

export function useUpsertSalaryStructure(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SalaryStructureUpsertPayload) => salaryStructureService.upsert(userId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.salaryStructure.detail(userId) });
      toast.success("Salary structure saved");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Couldn't save salary structure")),
  });
}

export function usePayrollRuns(params: PayrollRunListParams) {
  return useQuery({
    queryKey: queryKeys.payrollRuns.list(params),
    queryFn: () => payrollRunService.list(params),
    placeholderData: (prev) => prev,
  });
}

export function usePayrollRun(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.payrollRuns.detail(id ?? ""),
    queryFn: () => payrollRunService.get(id as string),
    enabled: Boolean(id),
  });
}

export function useMissingSalaryEmployees() {
  return useQuery({
    queryKey: queryKeys.payrollRuns.missingSalary,
    queryFn: () => payrollRunService.listMissingSalary(),
  });
}

export function useCreatePayrollRun() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ year, month }: { year: number; month: number }) => payrollRunService.create(year, month),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payrollRuns.all });
      const skippedCount = result.skipped_employees.length;
      if (skippedCount > 0) {
        toast.success(`Payroll run generated — ${skippedCount} employee(s) skipped (no salary set)`);
      } else {
        toast.success("Payroll run generated");
      }
    },
    onError: (error) => toast.error(getErrorMessage(error, "Couldn't generate payroll run")),
  });
}

export function useFinalizePayrollRun() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => payrollRunService.finalize(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payrollRuns.all });
      toast.success("Payroll run finalized");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Couldn't finalize payroll run")),
  });
}

export function useMarkPayrollRunPaid() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => payrollRunService.markPaid(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payrollRuns.all });
      toast.success("Payroll run marked as paid");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Couldn't mark payroll run as paid")),
  });
}

export function useRunPayslips(runId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.payrollRuns.payslips(runId ?? ""),
    queryFn: () => payrollRunService.listPayslips(runId as string),
    enabled: Boolean(runId),
  });
}

export function usePayslip(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.payslips.detail(id ?? ""),
    queryFn: () => payslipService.get(id as string),
    enabled: Boolean(id),
  });
}

export function useEmployeePayslipHistory(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.payslips.employeeHistory(userId ?? ""),
    queryFn: () => payslipService.getEmployeeHistory(userId as string),
    enabled: Boolean(userId),
  });
}

function useInvalidatePayslip(payslipId: string) {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.payslips.detail(payslipId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.payrollRuns.all });
    // Broad prefix match — invalidates every employee's cached payslip history,
    // not just one userId's key (invalidateQueries matches by key prefix).
    queryClient.invalidateQueries({ queryKey: ["payslips", "employee-history"] });
  };
}

export function useAddPayslipLineItem(payslipId: string) {
  const invalidate = useInvalidatePayslip(payslipId);
  return useMutation({
    mutationFn: (payload: PayslipLineItemCreatePayload) => payslipService.addLineItem(payslipId, payload),
    onSuccess: () => {
      invalidate();
      toast.success("Line item added");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Couldn't add line item")),
  });
}

export function useRemovePayslipLineItem(payslipId: string) {
  const invalidate = useInvalidatePayslip(payslipId);
  return useMutation({
    mutationFn: (itemId: string) => payslipService.removeLineItem(payslipId, itemId),
    onSuccess: () => {
      invalidate();
      toast.success("Line item removed");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Couldn't remove line item")),
  });
}

export function useRecurringLineItems(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.recurringLineItems.list(userId ?? ""),
    queryFn: () => recurringLineItemService.list(userId as string),
    enabled: Boolean(userId),
  });
}

function useInvalidateRecurringLineItems(userId: string) {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: queryKeys.recurringLineItems.list(userId) });
}

export function useCreateRecurringLineItem(userId: string) {
  const invalidate = useInvalidateRecurringLineItems(userId);
  return useMutation({
    mutationFn: (payload: RecurringLineItemCreatePayload) => recurringLineItemService.create(userId, payload),
    onSuccess: () => {
      invalidate();
      toast.success("Recurring item added");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Couldn't add recurring item")),
  });
}

export function useUpdateRecurringLineItem(userId: string) {
  const invalidate = useInvalidateRecurringLineItems(userId);
  return useMutation({
    mutationFn: ({ itemId, payload }: { itemId: string; payload: RecurringLineItemUpdatePayload }) =>
      recurringLineItemService.update(itemId, payload),
    onSuccess: () => {
      invalidate();
      toast.success("Recurring item updated");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Couldn't update recurring item")),
  });
}

export function useDeactivateRecurringLineItem(userId: string) {
  const invalidate = useInvalidateRecurringLineItems(userId);
  return useMutation({
    mutationFn: (itemId: string) => recurringLineItemService.deactivate(itemId),
    onSuccess: () => {
      invalidate();
      toast.success("Recurring item removed");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Couldn't remove recurring item")),
  });
}
