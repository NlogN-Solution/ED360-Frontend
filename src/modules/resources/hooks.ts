import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/constants/queryKeys";
import { getErrorMessage } from "@/utils/errors";
import { resourceService } from "./service";
import type { ResourceArticleCreatePayload, ResourceListParams, ResourceUpdatePayload } from "./types";

export function useResources(params: ResourceListParams) {
  return useQuery({
    queryKey: queryKeys.resources.list(params),
    queryFn: () => resourceService.list(params),
    placeholderData: (prev) => prev,
  });
}

export function useResource(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.resources.detail(id ?? ""),
    queryFn: () => resourceService.get(id as string),
    enabled: Boolean(id),
  });
}

function useInvalidateResources() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: queryKeys.resources.all });
}

export function useCreateArticleResource() {
  const invalidate = useInvalidateResources();
  return useMutation({
    mutationFn: (payload: ResourceArticleCreatePayload) => resourceService.createArticle(payload),
    onSuccess: () => {
      invalidate();
      toast.success("Article published");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Couldn't publish article")),
  });
}

export function useUploadFileResource() {
  const invalidate = useInvalidateResources();
  return useMutation({
    mutationFn: ({ file, ...meta }: { file: File; title?: string; description?: string; category?: string }) =>
      resourceService.uploadFile(file, meta),
    onSuccess: () => {
      invalidate();
      toast.success("File uploaded");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Couldn't upload file")),
  });
}

export function useUpdateResource(id: string) {
  const invalidate = useInvalidateResources();
  return useMutation({
    mutationFn: (payload: ResourceUpdatePayload) => resourceService.update(id, payload),
    onSuccess: () => {
      invalidate();
      toast.success("Resource updated");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Couldn't update resource")),
  });
}

export function useDeleteResource() {
  const invalidate = useInvalidateResources();
  return useMutation({
    mutationFn: (id: string) => resourceService.remove(id),
    onSuccess: () => {
      invalidate();
      toast.success("Resource deleted");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Couldn't delete resource")),
  });
}
