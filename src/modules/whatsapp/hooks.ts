import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/constants/queryKeys";
import { getErrorMessage } from "@/utils/errors";
import { integrationService, whatsappService } from "./service";
import type {
  WhatsAppConnectPayload,
  WhatsAppConversationListParams,
  WhatsAppEmbeddedSignupConnectPayload,
  WhatsAppMessageSendPayload,
} from "./types";

// --- Integration ------------------------------------------------------

export function useIntegrations() {
  return useQuery({
    queryKey: queryKeys.integrations.all,
    queryFn: () => integrationService.list(),
  });
}

export function useWhatsAppIntegrationStatus() {
  return useQuery({
    queryKey: queryKeys.integrations.whatsapp,
    queryFn: () => integrationService.whatsappStatus(),
  });
}

export function useConnectWhatsApp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: WhatsAppConnectPayload) => integrationService.connectWhatsApp(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.integrations.all });
      toast.success("WhatsApp Business connected");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Couldn't connect WhatsApp")),
  });
}

// null (not an error) means Embedded Signup isn't configured on this server
// — the connect dialog falls back to manual entry when this resolves to null.
export function useWhatsAppEmbeddedSignupConfig(options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: queryKeys.integrations.whatsappEmbeddedSignupConfig,
    queryFn: () => integrationService.whatsappEmbeddedSignupConfig(),
    staleTime: 5 * 60 * 1000,
    retry: false,
    enabled: options.enabled ?? true,
  });
}

export function useConnectWhatsAppEmbeddedSignup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: WhatsAppEmbeddedSignupConnectPayload) =>
      integrationService.connectWhatsAppEmbeddedSignup(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.integrations.all });
      toast.success("WhatsApp Business connected");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Couldn't connect WhatsApp")),
  });
}

export function useDisconnectWhatsApp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => integrationService.disconnectWhatsApp(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.integrations.all });
      toast.success("WhatsApp Business disconnected");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Couldn't disconnect WhatsApp")),
  });
}

export function useWhatsAppTemplates() {
  return useQuery({
    queryKey: queryKeys.integrations.whatsappTemplates,
    queryFn: () => integrationService.listWhatsAppTemplates(),
  });
}

export function useSyncWhatsAppTemplates() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => integrationService.syncWhatsAppTemplates(),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.integrations.whatsappTemplates });
      toast.success(`Synced ${data.total} template${data.total === 1 ? "" : "s"} from Meta`);
    },
    onError: (error) => toast.error(getErrorMessage(error, "Couldn't sync templates")),
  });
}

// --- Conversations / messages ------------------------------------------

// No websocket/SSE infra exists in this codebase — polling matches the
// Notification bell's existing pattern (Topbar.tsx, 30s). WhatsApp is more
// time-sensitive (a live chat), so a shorter interval; TanStack Query already
// pauses polling when the tab isn't focused.
const CONVERSATIONS_POLL_MS = 10_000;
const MESSAGES_POLL_MS = 8_000;

export function useWhatsAppConversations(params: WhatsAppConversationListParams, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: queryKeys.whatsapp.conversations(params),
    queryFn: () => whatsappService.listConversations(params),
    placeholderData: (prev) => prev,
    refetchInterval: CONVERSATIONS_POLL_MS,
    enabled: options.enabled ?? true,
  });
}

export function useWhatsAppMessages(conversationId: string | undefined, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: queryKeys.whatsapp.messages(conversationId ?? ""),
    queryFn: () => whatsappService.listMessages(conversationId as string),
    enabled: Boolean(conversationId) && (options.enabled ?? true),
    refetchInterval: MESSAGES_POLL_MS,
  });
}

export function useSendWhatsAppMessage(conversationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: WhatsAppMessageSendPayload) => whatsappService.sendMessage(conversationId, payload),
    onSuccess: (message) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.whatsapp.messages(conversationId) });
      queryClient.invalidateQueries({ queryKey: ["whatsapp", "conversations"] });
      if (message.status === "failed") {
        toast.error(message.error_message || "WhatsApp could not send this message.");
      }
    },
    onError: (error) => toast.error(getErrorMessage(error, "Couldn't send message")),
  });
}

export function useSendWhatsAppMedia(conversationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ file, caption }: { file: File; caption?: string }) =>
      whatsappService.sendMedia(conversationId, file, caption),
    onSuccess: (message) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.whatsapp.messages(conversationId) });
      queryClient.invalidateQueries({ queryKey: ["whatsapp", "conversations"] });
      if (message.status === "failed") {
        toast.error(message.error_message || "WhatsApp could not send this file.");
      }
    },
    onError: (error) => toast.error(getErrorMessage(error, "Couldn't send file")),
  });
}

export function useAssignWhatsAppConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ conversationId, assignedTo }: { conversationId: string; assignedTo: string | null }) =>
      whatsappService.assignConversation(conversationId, assignedTo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["whatsapp", "conversations"] });
      toast.success("Conversation assigned");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Couldn't assign conversation")),
  });
}

export function useMarkWhatsAppConversationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (conversationId: string) => whatsappService.markConversationRead(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["whatsapp", "conversations"] });
    },
  });
}
