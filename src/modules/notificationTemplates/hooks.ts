import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/constants/queryKeys";
import { getErrorMessage } from "@/utils/errors";
import { notificationTemplateService } from "./service";
import type { NotificationTemplateKey, NotificationTemplateUpdatePayload } from "./types";

export function useNotificationTemplates() {
  return useQuery({
    queryKey: queryKeys.notificationTemplates.all,
    queryFn: () => notificationTemplateService.list(),
  });
}

export function useUpdateNotificationTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ key, payload }: { key: NotificationTemplateKey; payload: NotificationTemplateUpdatePayload }) =>
      notificationTemplateService.update(key, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notificationTemplates.all });
      toast.success("Template updated");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Couldn't update template")),
  });
}
