import { apiClient } from "@/services/apiClient";
import type {
  NotificationTemplateKey,
  NotificationTemplateListResponse,
  NotificationTemplateRead,
  NotificationTemplateUpdatePayload,
} from "./types";

export const notificationTemplateService = {
  async list(): Promise<NotificationTemplateListResponse> {
    const { data } = await apiClient.get<NotificationTemplateListResponse>("/notification-templates");
    return data;
  },

  async update(key: NotificationTemplateKey, payload: NotificationTemplateUpdatePayload): Promise<NotificationTemplateRead> {
    const { data } = await apiClient.patch<NotificationTemplateRead>(`/notification-templates/${key}`, payload);
    return data;
  },
};
