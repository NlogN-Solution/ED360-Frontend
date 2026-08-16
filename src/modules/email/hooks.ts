import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/constants/queryKeys";
import { getErrorMessage } from "@/utils/errors";
import { emailIntegrationService, emailService } from "./service";
import type { EmailComposePayload, EmailConnectPayload, EmailMessageSendPayload, EmailThreadListParams } from "./types";

// --- Integration ------------------------------------------------------

// null (not an error) means Google sign-in isn't configured on this server
// — the connect dialog shows a "not available" message when this is null.
export function useEmailOAuthConfig(options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: queryKeys.integrations.emailOAuthConfig,
    queryFn: () => emailIntegrationService.oauthConfig(),
    staleTime: 5 * 60 * 1000,
    retry: false,
    enabled: options.enabled ?? true,
  });
}

export function useEmailIntegrationStatus() {
  return useQuery({
    queryKey: queryKeys.integrations.email,
    queryFn: () => emailIntegrationService.status(),
  });
}

export function useConnectEmailGoogle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: EmailConnectPayload) => emailIntegrationService.connectGoogle(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.integrations.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.integrations.email });
      toast.success("Email connected");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Couldn't connect email")),
  });
}

export function useDisconnectEmail() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => emailIntegrationService.disconnect(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.integrations.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.integrations.email });
      toast.success("Email disconnected");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Couldn't disconnect email")),
  });
}

// --- Threads / messages ------------------------------------------------

// No websocket/SSE infra exists in this codebase — same polling pattern as
// WhatsApp's hooks.ts (see that file's comment for the full rationale).
const THREADS_POLL_MS = 15_000;
const MESSAGES_POLL_MS = 12_000;

export function useEmailThreads(params: EmailThreadListParams, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: queryKeys.email.threads(params),
    queryFn: () => emailService.listThreads(params),
    placeholderData: (prev) => prev,
    refetchInterval: THREADS_POLL_MS,
    enabled: options.enabled ?? true,
  });
}

export function useEmailMessages(threadId: string | undefined, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: queryKeys.email.messages(threadId ?? ""),
    queryFn: () => emailService.listMessages(threadId as string),
    enabled: Boolean(threadId) && (options.enabled ?? true),
    refetchInterval: MESSAGES_POLL_MS,
  });
}

export function useSendEmailReply(threadId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ payload, files }: { payload: EmailMessageSendPayload; files?: File[] }) =>
      files?.length
        ? emailService.sendReplyWithAttachments(threadId, payload, files)
        : emailService.sendReply(threadId, payload),
    onSuccess: (message) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.email.messages(threadId) });
      queryClient.invalidateQueries({ queryKey: ["email", "threads"] });
      if (message.status === "failed") {
        toast.error(message.error_message || "This email could not be sent.");
      }
    },
    onError: (error) => toast.error(getErrorMessage(error, "Couldn't send email")),
  });
}

export function useComposeEmail() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ payload, files }: { payload: EmailComposePayload; files?: File[] }) =>
      files?.length ? emailService.composeWithAttachments(payload, files) : emailService.compose(payload),
    onSuccess: (message) => {
      queryClient.invalidateQueries({ queryKey: ["email", "threads"] });
      if (message.status === "failed") {
        toast.error(message.error_message || "This email could not be sent.");
      } else {
        toast.success("Email sent");
      }
    },
    onError: (error) => toast.error(getErrorMessage(error, "Couldn't send email")),
  });
}

export function useAssignEmailThread() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ threadId, assignedTo }: { threadId: string; assignedTo: string | null }) =>
      emailService.assignThread(threadId, assignedTo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email", "threads"] });
      toast.success("Thread assigned");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Couldn't assign thread")),
  });
}

export function useMarkEmailThreadRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (threadId: string) => emailService.markThreadRead(threadId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email", "threads"] });
    },
  });
}
