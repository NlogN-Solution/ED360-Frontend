export type OrgSubscriptionPlan = "starter" | "professional" | "enterprise";
export type OrgSubscriptionStatus = "trialing" | "active" | "past_due" | "cancelled";
export type BillingCycle = "monthly" | "yearly";

export interface OrganizationRead {
  id: string;
  name: string;
  slug: string;
  email: string | null;
  phone: string | null;
  country: string | null;
  timezone: string | null;
  logo_url: string | null;
  favicon_url: string | null;
  default_language: string | null;
  default_currency: string | null;
  date_format: string | null;
  time_format: string | null;
  maintenance_mode: boolean;
  registration_enabled: boolean;
  status: "trial" | "active" | "suspended" | "cancelled";
  created_at: string;
  updated_at: string;
}

export interface OrganizationUpdatePayload {
  name?: string;
  email?: string | null;
  phone?: string | null;
  country?: string | null;
  timezone?: string | null;
  default_language?: string | null;
  default_currency?: string | null;
  date_format?: string | null;
  time_format?: string | null;
  maintenance_mode?: boolean;
  registration_enabled?: boolean;
}

export interface SeatUsage {
  staff_used: number;
  staff_limit: number | null;
  student_used: number;
  student_limit: number | null;
}

export interface OrganizationSubscriptionRead {
  id: string;
  organization_id: string;
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
  usage: SeatUsage;
  created_at: string;
  updated_at: string;
}

export interface CardDetails {
  card_number: string;
  expiry: string;
  cvv: string;
}

export interface PurchaseSeatsPayload {
  additional_seats: number;
  card: CardDetails;
}

export interface ChangePlanPayload {
  plan: OrgSubscriptionPlan;
  card: CardDetails;
}
