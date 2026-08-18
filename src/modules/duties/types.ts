import type { DutyPriority, DutyStatus, DutyType } from "@/types/enums";

export interface JobRoleRef {
  id: string;
  name: string;
}

export interface DepartmentRef {
  id: string;
  name: string;
}

export interface UserRef {
  id: string;
  first_name: string;
  last_name: string;
}

export interface Duty {
  id: string;
  organization_id: string | null;
  type: DutyType;
  category: string | null;
  priority: DutyPriority;
  status: DutyStatus;
  requires_acknowledgement: boolean;
  acknowledgement_deadline: string | null;
  effective_from: string | null;
  review_date: string | null;
  title: string | null;
  content: string | null;
  version: number | null;
  published_at: string | null;
  job_roles: JobRoleRef[];
  departments: DepartmentRef[];
  users: UserRef[];
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
  is_acknowledged_by_me: boolean | null;
  acknowledged_count: number | null;
  applicable_count: number | null;
}

export interface DutyCreatePayload {
  title: string;
  content: string;
  type: DutyType;
  category?: string | null;
  priority?: DutyPriority;
  requires_acknowledgement?: boolean;
  acknowledgement_deadline?: string | null;
  effective_from?: string | null;
  review_date?: string | null;
  job_role_ids?: string[];
  department_ids?: string[];
  user_ids?: string[];
  publish?: boolean;
}

export interface DutyUpdatePayload {
  title?: string;
  content?: string;
  category?: string | null;
  priority?: DutyPriority;
  requires_acknowledgement?: boolean;
  acknowledgement_deadline?: string | null;
  effective_from?: string | null;
  review_date?: string | null;
  job_role_ids?: string[];
  department_ids?: string[];
  user_ids?: string[];
}

export interface DutyListParams {
  page?: number;
  limit?: number;
  type?: DutyType;
  category?: string;
  status?: DutyStatus;
  department_id?: string;
  job_role_id?: string;
  user_id?: string;
  search?: string;
}

export interface DutyVersion {
  id: string;
  version: number;
  title: string;
  content: string;
  published_at: string | null;
  created_by: string | null;
  created_at: string;
  acknowledgement_count: number;
}

export interface AcknowledgementStatus {
  user: UserRef;
  acknowledged: boolean;
  acknowledged_at: string | null;
}

export interface DutyAcknowledgementSummary {
  duty_id: string;
  version: number;
  total_applicable: number;
  total_acknowledged: number;
  statuses: AcknowledgementStatus[];
}
