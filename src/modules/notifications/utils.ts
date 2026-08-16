import { NotificationType } from "@/types/enums";
import type { NotificationRead } from "./types";

// Fallback list routes for notification types with no related_id (either
// the notification predates that column, or its type never carries a
// linkable entity). Leads and follow-up-due notifications carry related_id
// today and route straight to the specific lead instead — see notificationPath.
const NOTIFICATION_FALLBACK_ROUTES: Partial<Record<NotificationType, string>> = {
  [NotificationType.DOCUMENT]: "/documents",
  [NotificationType.LEAD]: "/leads",
  [NotificationType.FOLLOW_UP_DUE]: "/leads",
  [NotificationType.TASK]: "/tasks",
  [NotificationType.APPOINTMENT]: "/appointments",
  [NotificationType.PAYMENT]: "/payments",
  [NotificationType.APPLICATION]: "/applications",
  [NotificationType.APPLICANT]: "/applicants",
  [NotificationType.WHATSAPP]: "/communication?tab=whatsapp",
};

export function notificationPath(n: NotificationRead): string | null {
  if (n.related_id) {
    if (n.type === NotificationType.LEAD) return `/leads/${n.related_id}`;
    if (n.type === NotificationType.FOLLOW_UP_DUE) return `/leads/${n.related_id}?tab=follow-ups`;
    if (n.type === NotificationType.APPLICATION) return `/applications/${n.related_id}`;
    if (n.type === NotificationType.APPLICANT) return `/applicants/${n.related_id}`;
    // related_id is the WhatsAppConversation id — deep-links straight into it,
    // same idea as the follow-up tab link above.
    if (n.type === NotificationType.WHATSAPP) return `/communication?tab=whatsapp&conversation=${n.related_id}`;
  }
  return NOTIFICATION_FALLBACK_ROUTES[n.type] ?? null;
}
