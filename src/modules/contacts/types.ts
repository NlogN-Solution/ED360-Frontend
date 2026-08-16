import type { ContactType } from "@/types/enums";

export interface Contact {
  id: string;
  organization_id: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  contact_type: ContactType;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ContactListParams {
  page?: number;
  limit?: number;
  search?: string;
  contact_type?: ContactType;
}

export interface ContactCreatePayload {
  name: string;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  contact_type?: ContactType;
  notes?: string | null;
  is_active?: boolean;
}

export type ContactUpdatePayload = Partial<ContactCreatePayload>;
