import { apiClient } from "@/services/apiClient";
import type {
  IntegrationRead,
  WhatsAppAccountRead,
  WhatsAppConnectPayload,
  WhatsAppConversationList,
  WhatsAppConversationListParams,
  WhatsAppConversationRead,
  WhatsAppEmbeddedSignupConfig,
  WhatsAppEmbeddedSignupConnectPayload,
  WhatsAppIntegrationStatus,
  WhatsAppMessageList,
  WhatsAppMessageRead,
  WhatsAppMessageSendPayload,
  WhatsAppTemplateList,
} from "./types";

export const integrationService = {
  async list(): Promise<IntegrationRead[]> {
    const { data } = await apiClient.get<IntegrationRead[]>("/integrations");
    return data;
  },

  async whatsappStatus(): Promise<WhatsAppIntegrationStatus> {
    const { data } = await apiClient.get<WhatsAppIntegrationStatus>("/integrations/whatsapp");
    return data;
  },

  async connectWhatsApp(payload: WhatsAppConnectPayload): Promise<WhatsAppAccountRead> {
    const { data } = await apiClient.post<WhatsAppAccountRead>("/integrations/whatsapp/connect", payload);
    return data;
  },

  async whatsappEmbeddedSignupConfig(): Promise<WhatsAppEmbeddedSignupConfig | null> {
    const { data } = await apiClient.get<WhatsAppEmbeddedSignupConfig | null>(
      "/integrations/whatsapp/embedded-signup-config",
    );
    return data;
  },

  async connectWhatsAppEmbeddedSignup(payload: WhatsAppEmbeddedSignupConnectPayload): Promise<WhatsAppAccountRead> {
    const { data } = await apiClient.post<WhatsAppAccountRead>(
      "/integrations/whatsapp/connect/embedded-signup",
      payload,
    );
    return data;
  },

  async disconnectWhatsApp(): Promise<IntegrationRead> {
    const { data } = await apiClient.post<IntegrationRead>("/integrations/whatsapp/disconnect");
    return data;
  },

  async listWhatsAppTemplates(): Promise<WhatsAppTemplateList> {
    const { data } = await apiClient.get<WhatsAppTemplateList>("/integrations/whatsapp/templates");
    return data;
  },

  async syncWhatsAppTemplates(): Promise<WhatsAppTemplateList> {
    const { data } = await apiClient.post<WhatsAppTemplateList>("/integrations/whatsapp/templates/sync");
    return data;
  },
};

export const whatsappService = {
  async listConversations(params: WhatsAppConversationListParams): Promise<WhatsAppConversationList> {
    const { data } = await apiClient.get<WhatsAppConversationList>("/whatsapp/conversations", { params });
    return data;
  },

  async getConversation(id: string): Promise<WhatsAppConversationRead> {
    const { data } = await apiClient.get<WhatsAppConversationRead>(`/whatsapp/conversations/${id}`);
    return data;
  },

  async listMessages(conversationId: string, page = 1, limit = 50): Promise<WhatsAppMessageList> {
    const { data } = await apiClient.get<WhatsAppMessageList>(`/whatsapp/conversations/${conversationId}/messages`, {
      params: { page, limit },
    });
    return data;
  },

  async sendMessage(conversationId: string, payload: WhatsAppMessageSendPayload): Promise<WhatsAppMessageRead> {
    const { data } = await apiClient.post<WhatsAppMessageRead>(
      `/whatsapp/conversations/${conversationId}/messages`,
      payload,
    );
    return data;
  },

  async sendMedia(conversationId: string, file: File, caption?: string): Promise<WhatsAppMessageRead> {
    const form = new FormData();
    form.append("file", file);
    if (caption) form.append("caption", caption);
    const { data } = await apiClient.post<WhatsAppMessageRead>(
      `/whatsapp/conversations/${conversationId}/messages/media`,
      form,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return data;
  },

  async assignConversation(conversationId: string, assignedTo: string | null): Promise<WhatsAppConversationRead> {
    const { data } = await apiClient.post<WhatsAppConversationRead>(`/whatsapp/conversations/${conversationId}/assign`, {
      assigned_to: assignedTo,
    });
    return data;
  },

  async markConversationRead(conversationId: string): Promise<WhatsAppConversationRead> {
    const { data } = await apiClient.post<WhatsAppConversationRead>(`/whatsapp/conversations/${conversationId}/read`);
    return data;
  },
};
