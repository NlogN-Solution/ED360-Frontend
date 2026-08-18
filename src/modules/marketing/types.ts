import type { LeadPriority, LeadSource, LeadStatus } from "@/types/enums";

export interface SegmentFilters {
  source: LeadSource[];
  status: LeadStatus[];
  priority: LeadPriority[];
  tags: string[];
  interested_country: string | null;
  interested_course: string | null;
  assigned_to: string[];
  created_from: string | null;
  created_to: string | null;
}

export const EMPTY_SEGMENT_FILTERS: SegmentFilters = {
  source: [],
  status: [],
  priority: [],
  tags: [],
  interested_country: null,
  interested_course: null,
  assigned_to: [],
  created_from: null,
  created_to: null,
};

export interface AudienceSegment {
  id: string;
  organization_id: string | null;
  name: string;
  description: string | null;
  filters: SegmentFilters;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  member_count: number | null;
}

export interface AudienceSegmentCreatePayload {
  name: string;
  description?: string | null;
  filters: SegmentFilters;
}

export type AudienceSegmentUpdatePayload = Partial<AudienceSegmentCreatePayload>;

export interface SegmentLead {
  id: string;
  first_name: string;
  last_name: string | null;
  email: string | null;
  phone: string;
  source: LeadSource;
  status: LeadStatus;
  priority: LeadPriority;
  interested_country: string | null;
  interested_course: string | null;
}

export interface SegmentPreview {
  total: number;
  items: SegmentLead[];
}
