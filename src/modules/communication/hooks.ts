import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/constants/queryKeys";
import { getErrorMessage } from "@/utils/errors";
import type { CommunicationKind } from "@/types/enums";
import { communicationService } from "./service";
import type { ConversationCreatePayload, MessageCreatePayload } from "./types";

export function useConversations(kind: CommunicationKind, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: queryKeys.communication.conversations(kind),
    queryFn: () => communicationService.listConversations(kind),
    enabled: options.enabled ?? true,
    refetchInterval: 15_000,
  });
}

export function useCreateConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ConversationCreatePayload) => communicationService.createConversation(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.communication.all }),
    onError: (error) => toast.error(getErrorMessage(error, "Couldn't open conversation")),
  });
}

export function useMessages(conversationId: string | undefined, params: { page?: number; limit?: number } = {}) {
  return useQuery({
    queryKey: queryKeys.communication.messages(conversationId ?? "", params),
    queryFn: () => communicationService.listMessages(conversationId as string, params),
    enabled: Boolean(conversationId),
    refetchInterval: 10_000,
  });
}

export function useSendMessage(conversationId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: MessageCreatePayload) => communicationService.sendMessage(conversationId as string, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.communication.all }),
    onError: (error) => toast.error(getErrorMessage(error, "Couldn't send message")),
  });
}

export function useMarkConversationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (conversationId: string) => communicationService.markRead(conversationId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.communication.all }),
  });
}

export function useUnreadMessageCount(options: { refetchInterval?: number } = {}) {
  return useQuery({
    queryKey: queryKeys.communication.unreadCount,
    queryFn: () => communicationService.unreadCount(),
    refetchInterval: options.refetchInterval,
  });
}
