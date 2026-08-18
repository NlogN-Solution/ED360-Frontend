import type { PayrollRunStatus, PayslipLineItemCategory, PayslipLineType } from "@/types/enums";

export interface SalaryStructure {
  id: string;
  organization_id: string | null;
  user_id: string;
  basic_salary: number;
  currency: string;
  bank_name: string | null;
  bank_account_name: string | null;
  bank_account_number: string | null;
  created_at: string;
  updated_at: string;
}

export interface SalaryStructureUpsertPayload {
  basic_salary: number;
  currency?: string;
  bank_name?: string | null;
  bank_account_name?: string | null;
  bank_account_number?: string | null;
}

export interface PayrollRun {
  id: string;
  organization_id: string | null;
  period_year: number;
  period_month: number;
  status: PayrollRunStatus;
  generated_by: string | null;
  generated_at: string | null;
  finalized_by: string | null;
  finalized_at: string | null;
  paid_by: string | null;
  paid_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface SkippedEmployee {
  id: string;
  name: string;
}

export interface PayrollRunGenerateResult extends PayrollRun {
  skipped_employees: SkippedEmployee[];
}

export interface PayslipLineItem {
  id: string;
  payslip_id: string;
  type: PayslipLineType;
  category: PayslipLineItemCategory;
  label: string;
  amount: number;
  created_by: string | null;
  created_at: string;
}

export interface PayslipLineItemCreatePayload {
  type: PayslipLineType;
  category?: PayslipLineItemCategory;
  label: string;
  amount: number;
}

export interface RecurringLineItem {
  id: string;
  organization_id: string | null;
  user_id: string;
  type: PayslipLineType;
  category: PayslipLineItemCategory;
  label: string;
  amount: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RecurringLineItemCreatePayload {
  type: PayslipLineType;
  category?: PayslipLineItemCategory;
  label: string;
  amount: number;
}

export interface RecurringLineItemUpdatePayload {
  category?: PayslipLineItemCategory;
  label?: string;
  amount?: number;
  is_active?: boolean;
}

export interface Payslip {
  id: string;
  organization_id: string | null;
  payroll_run_id: string;
  user_id: string;
  basic_salary: number;
  currency: string;
  expected_work_days: number;
  present_days: number;
  paid_leave_days: number;
  unpaid_days: number;
  attendance_deduction: number;
  additions_total: number;
  deductions_total: number;
  net_pay: number;
  run_status: PayrollRunStatus;
  run_period: string;
  line_items: PayslipLineItem[];
  created_at: string;
  updated_at: string;
}
