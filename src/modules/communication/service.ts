import { apiClient } from "@/services/apiClient";
import type { ListResponse } from "@/types/api";
import type { CommunicationKind } from "@/types/enums";
import type {
  ConversationCreatePayload,
  ConversationListItem,
  ConversationListResponse,
  MessageCreatePayload,
  MessageRead,
  UnreadCountResponse,
} from "./types";

export const communicationService = {
  async listConversations(kind: CommunicationKind): Promise<ConversationListResponse> {
    const { data } = await apiClient.get<ConversationListResponse>("/communication/conversations", {
      params: { kind },
    });
    return data;
  },

  async createConversation(payload: ConversationCreatePayload): Promise<ConversationListItem> {
    const { data } = await apiClient.post<ConversationListItem>("/communication/conversations", payload);
    return data;
  },

  async listMessages(
    conversationId: string,
    params: { page?: number; limit?: number } = {},
  ): Promise<ListResponse<MessageRead>> {
    const { data } = await apiClient.get<ListResponse<MessageRead>>(
      `/communication/conversations/${conversationId}/messages`,
      { params },
    );
    return data;
  },

  async sendMessage(conversationId: string, payload: MessageCreatePayload): Promise<MessageRead> {
    const { data } = await apiClient.post<MessageRead>(
      `/communication/conversations/${conversationId}/messages`,
      payload,
    );
    return data;
  },

  async markRead(conversationId: string): Promise<void> {
    await apiClient.post(`/communication/conversations/${conversationId}/read`);
  },

  async unreadCount(): Promise<UnreadCountResponse> {
    const { data } = await apiClient.get<UnreadCountResponse>("/communication/unread-count");
    return data;
  },
};
