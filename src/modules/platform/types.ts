import type { BillingCycle, OrgSubscriptionPlan, OrgSubscriptionStatus, SeatUsage } from "@/modules/subscription/types";

export type OrganizationStatus = "trial" | "active" | "suspended" | "cancelled";

export interface PlatformOrganizationRead {
  id: string;
  name: string;
  slug: string;
  status: OrganizationStatus;
  plan: OrgSubscriptionPlan | null;
  usage: SeatUsage;
  created_at: string | null;
}

export interface PlatformOrganizationList {
  items: PlatformOrganizationRead[];
  total: number;
  page: number;
  limit: number;
}

export interface PlatformSubscriptionRead {
  plan: OrgSubscriptionPlan;
  status: OrgSubscriptionStatus;
  billing_cycle: BillingCycle;
  included_staff_seats: number | null;
  extra_staff_seats: number;
  student_limit: number | null;
  storage_limit_mb: number | null;
  price: number;
  renewal_date: string | null;
  trial_end_date: string | null;
}

export interface PlatformBillingEventRead {
  id: string;
  event_type: "signup" | "seat_purchase" | "plan_change";
  status: "succeeded" | "failed";
  amount: number;
  description: string | null;
  created_at: string | null;
}

export interface PlatformOrganizationDetail {
  organization: PlatformOrganizationRead;
  subscription: PlatformSubscriptionRead | null;
  billing_events: PlatformBillingEventRead[];
}

export interface PlatformOrganizationListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: OrganizationStatus;
}

export interface UpdateOrganizationStatusPayload {
  status: OrganizationStatus;
}

export interface PlatformChangePlanPayload {
  plan: OrgSubscriptionPlan;
}
