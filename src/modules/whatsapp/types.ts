import type {
  IntegrationProvider,
  IntegrationStatus,
  WhatsAppContactEntityType,
  WhatsAppMessageDirection,
  WhatsAppMessageStatus,
  WhatsAppMessageType,
  WhatsAppTemplateStatus,
} from "@/types/enums";

// --- Integration ------------------------------------------------------

export interface IntegrationRead {
  id: string;
  provider: IntegrationProvider;
  status: IntegrationStatus;
  connected_by: string | null;
  connected_at: string | null;
  last_error: string | null;
  created_at: string;
}

export interface WhatsAppAccountRead {
  id: string;
  phone_number_id: string;
  whatsapp_business_account_id: string;
  display_phone_number: string;
  created_at: string;
}

export interface WhatsAppIntegrationStatus {
  integration: IntegrationRead | null;
  account: WhatsAppAccountRead | null;
}

export interface WhatsAppConnectPayload {
  phone_number_id: string;
  whatsapp_business_account_id: string;
  access_token: string;
}

export interface WhatsAppEmbeddedSignupConfig {
  app_id: string;
  config_id: string;
}

export interface WhatsAppEmbeddedSignupConnectPayload {
  code: string;
  phone_number_id: string;
  whatsapp_business_account_id: string;
}

// --- Contacts / Conversations ------------------------------------------

export interface WhatsAppContactRead {
  id: string;
  phone_e164: string;
  wa_profile_name: string | null;
  matched_entity_type: WhatsAppContactEntityType | null;
  matched_entity_id: string | null;
}

export interface WhatsAppConversationRead {
  id: string;
  contact: WhatsAppContactRead;
  assigned_to: string | null;
  last_message_at: string | null;
  window_expires_at: string | null;
  unread_count: number;
  last_message_preview: string | null;
  created_at: string;
}

export interface WhatsAppConversationList {
  items: WhatsAppConversationRead[];
  total: number;
  page: number;
  limit: number;
}

export interface WhatsAppConversationListParams {
  page?: number;
  limit?: number;
  search?: string;
  assigned_to?: string;
  unassigned?: boolean;
}

// --- Messages ------------------------------------------------------------

export interface WhatsAppMessageRead {
  id: string;
  conversation_id: string;
  direction: WhatsAppMessageDirection;
  message_type: WhatsAppMessageType;
  status: WhatsAppMessageStatus | null;
  body: string | null;
  media_url: string | null;
  media_mime_type: string | null;
  template_name: string | null;
  template_variables: { language?: string; values?: string[] } | null;
  sender_id: string | null;
  error_message: string | null;
  created_at: string;
}

export interface WhatsAppMessageList {
  items: WhatsAppMessageRead[];
  total: number;
}

export interface WhatsAppMessageSendPayload {
  message_type: "text" | "template";
  body?: string;
  template_name?: string;
  template_language?: string;
  template_variables?: string[];
}

// --- Templates ------------------------------------------------------------

export interface WhatsAppTemplateRead {
  id: string;
  name: string;
  language: string;
  category: string;
  status: WhatsAppTemplateStatus;
  body_text: string | null;
  variable_count: number;
  external_template_id: string | null;
  synced_at: string;
}

export interface WhatsAppTemplateList {
  items: WhatsAppTemplateRead[];
  total: number;
}
