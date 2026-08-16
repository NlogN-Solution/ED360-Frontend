export enum NotificationTemplateKey {
  LEAD_WELCOME = "lead_welcome",
  FOLLOW_UP_REMINDER = "follow_up_reminder",
  APPLICATION_SUBMITTED = "application_submitted",
  OFFER_RECEIVED = "offer_received",
  DOCUMENT_REQUIRED = "document_required",
  VISA_UPDATE = "visa_update",
  PAYMENT_REMINDER = "payment_reminder",
  STAFF_NOTIFICATION = "staff_notification",
}

export interface NotificationTemplateRead {
  key: NotificationTemplateKey;
  subject: string;
  body: string;
  is_active: boolean;
  id: string | null;
  organization_id: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface NotificationTemplateUpdatePayload {
  subject?: string;
  body?: string;
  is_active?: boolean;
}

export interface NotificationTemplateListResponse {
  items: NotificationTemplateRead[];
}

export const TEMPLATE_LABELS: Record<NotificationTemplateKey, string> = {
  [NotificationTemplateKey.LEAD_WELCOME]: "Lead Welcome",
  [NotificationTemplateKey.FOLLOW_UP_REMINDER]: "Follow-up Reminder",
  [NotificationTemplateKey.APPLICATION_SUBMITTED]: "Application Submitted",
  [NotificationTemplateKey.OFFER_RECEIVED]: "Offer Received",
  [NotificationTemplateKey.DOCUMENT_REQUIRED]: "Document Required",
  [NotificationTemplateKey.VISA_UPDATE]: "Visa Update",
  [NotificationTemplateKey.PAYMENT_REMINDER]: "Payment Reminder",
  [NotificationTemplateKey.STAFF_NOTIFICATION]: "Staff Notifications",
};

export const TEMPLATE_PLACEHOLDERS: Record<NotificationTemplateKey, string[]> = {
  [NotificationTemplateKey.LEAD_WELCOME]: ["{{lead_name}}"],
  [NotificationTemplateKey.FOLLOW_UP_REMINDER]: ["{{lead_name}}", "{{lead_priority}}"],
  [NotificationTemplateKey.APPLICATION_SUBMITTED]: ["{{program_name}}", "{{university_name}}"],
  [NotificationTemplateKey.OFFER_RECEIVED]: ["{{program_name}}", "{{university_name}}"],
  [NotificationTemplateKey.DOCUMENT_REQUIRED]: ["{{document_name}}", "{{program_name}}"],
  [NotificationTemplateKey.VISA_UPDATE]: ["{{program_name}}", "{{status}}"],
  [NotificationTemplateKey.PAYMENT_REMINDER]: ["{{amount}}"],
  [NotificationTemplateKey.STAFF_NOTIFICATION]: ["{{message}}"],
};
