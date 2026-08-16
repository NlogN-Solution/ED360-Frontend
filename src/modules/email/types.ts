import type { EmailContactEntityType, EmailMessageDirection, EmailMessageStatus } from "@/types/enums";
import type { IntegrationRead } from "@/modules/whatsapp/types";

// --- Integration ------------------------------------------------------

export interface EmailAccountRead {
  id: string;
  email_address: string;
  last_synced_at: string | null;
  created_at: string;
}

export interface EmailIntegrationStatus {
  integration: IntegrationRead | null;
  account: EmailAccountRead | null;
}

export interface EmailOAuthConfig {
  client_id: string;
}

export interface EmailConnectPayload {
  code: string;
  redirect_uri: string;
}

// --- Contacts / Threads ------------------------------------------------

export interface EmailContactRead {
  id: string;
  email_address: string;
  display_name: string | null;
  matched_entity_type: EmailContactEntityType | null;
  matched_entity_id: string | null;
}

export interface EmailThreadRead {
  id: string;
  contact: EmailContactRead;
  subject: string | null;
  assigned_to: string | null;
  last_message_at: string | null;
  unread_count: number;
  last_message_preview: string | null;
  created_at: string;
}

export interface EmailThreadList {
  items: EmailThreadRead[];
  total: number;
  page: number;
  limit: number;
}

export interface EmailThreadListParams {
  page?: number;
  limit?: number;
  search?: string;
  assigned_to?: string;
  unassigned?: boolean;
}

// --- Messages ------------------------------------------------------------

export interface EmailAttachmentRead {
  id: string;
  filename: string;
  mime_type: string;
  size_bytes: number | null;
  local_url: string | null;
}

export interface EmailMessageRead {
  id: string;
  thread_id: string;
  direction: EmailMessageDirection;
  status: EmailMessageStatus | null;
  from_address: string;
  to_addresses: string[];
  cc_addresses: string[] | null;
  body_text: string | null;
  body_html: string | null;
  sender_id: string | null;
  error_message: string | null;
  attachments: EmailAttachmentRead[];
  created_at: string;
}

export interface EmailMessageList {
  items: EmailMessageRead[];
  total: number;
}

export interface EmailMessageSendPayload {
  body_text: string;
  to?: string[];
  cc?: string[];
}

export interface EmailComposePayload {
  to: string[];
  cc?: string[];
  subject: string;
  body_text: string;
}
