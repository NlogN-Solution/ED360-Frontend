import { apiClient } from "@/services/apiClient";
import type { IntegrationRead } from "@/modules/whatsapp/types";
import type {
  EmailAccountRead,
  EmailComposePayload,
  EmailConnectPayload,
  EmailIntegrationStatus,
  EmailMessageList,
  EmailMessageRead,
  EmailMessageSendPayload,
  EmailOAuthConfig,
  EmailThreadList,
  EmailThreadListParams,
  EmailThreadRead,
} from "./types";

export const emailIntegrationService = {
  async oauthConfig(): Promise<EmailOAuthConfig | null> {
    const { data } = await apiClient.get<EmailOAuthConfig | null>("/integrations/email/oauth-config");
    return data;
  },

  async status(): Promise<EmailIntegrationStatus> {
    const { data } = await apiClient.get<EmailIntegrationStatus>("/integrations/email");
    return data;
  },

  async connectGoogle(payload: EmailConnectPayload): Promise<EmailAccountRead> {
    const { data } = await apiClient.post<EmailAccountRead>("/integrations/email/connect/google", payload);
    return data;
  },

  async disconnect(): Promise<IntegrationRead> {
    const { data } = await apiClient.post<IntegrationRead>("/integrations/email/disconnect");
    return data;
  },
};

export const emailService = {
  async listThreads(params: EmailThreadListParams): Promise<EmailThreadList> {
    const { data } = await apiClient.get<EmailThreadList>("/email/threads", { params });
    return data;
  },

  async getThread(id: string): Promise<EmailThreadRead> {
    const { data } = await apiClient.get<EmailThreadRead>(`/email/threads/${id}`);
    return data;
  },

  async listMessages(threadId: string, page = 1, limit = 50): Promise<EmailMessageList> {
    const { data } = await apiClient.get<EmailMessageList>(`/email/threads/${threadId}/messages`, {
      params: { page, limit },
    });
    return data;
  },

  async sendReply(threadId: string, payload: EmailMessageSendPayload): Promise<EmailMessageRead> {
    const { data } = await apiClient.post<EmailMessageRead>(`/email/threads/${threadId}/messages`, payload);
    return data;
  },

  async sendReplyWithAttachments(
    threadId: string,
    payload: EmailMessageSendPayload,
    files: File[],
  ): Promise<EmailMessageRead> {
    const form = new FormData();
    form.append("body_text", payload.body_text);
    if (payload.to?.length) form.append("to", payload.to.join(","));
    if (payload.cc?.length) form.append("cc", payload.cc.join(","));
    files.forEach((file) => form.append("files", file));
    const { data } = await apiClient.post<EmailMessageRead>(`/email/threads/${threadId}/messages/attachments`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  async compose(payload: EmailComposePayload): Promise<EmailMessageRead> {
    const { data } = await apiClient.post<EmailMessageRead>("/email/compose", payload);
    return data;
  },

  async composeWithAttachments(payload: EmailComposePayload, files: File[]): Promise<EmailMessageRead> {
    const form = new FormData();
    form.append("to", payload.to.join(","));
    if (payload.cc?.length) form.append("cc", payload.cc.join(","));
    form.append("subject", payload.subject);
    form.append("body_text", payload.body_text);
    files.forEach((file) => form.append("files", file));
    const { data } = await apiClient.post<EmailMessageRead>("/email/compose/attachments", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  async assignThread(threadId: string, assignedTo: string | null): Promise<EmailThreadRead> {
    const { data } = await apiClient.post<EmailThreadRead>(`/email/threads/${threadId}/assign`, {
      assigned_to: assignedTo,
    });
    return data;
  },

  async markThreadRead(threadId: string): Promise<EmailThreadRead> {
    const { data } = await apiClient.post<EmailThreadRead>(`/email/threads/${threadId}/read`);
    return data;
  },
};
