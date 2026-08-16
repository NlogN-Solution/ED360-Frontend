import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/constants/queryKeys";
import { getErrorMessage } from "@/utils/errors";
import type { CommentEntityType } from "@/types/enums";
import { commentService } from "./service";

export function useComments(entityType: CommentEntityType, entityId: string | undefined, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: queryKeys.comments.list(entityType, entityId ?? ""),
    queryFn: () => commentService.list(entityType, entityId as string),
    enabled: Boolean(entityId) && (options.enabled ?? true),
  });
}

export function useCommentCounts(entityType: CommentEntityType, entityIds: string[]) {
  const sorted = [...entityIds].sort();
  return useQuery({
    queryKey: queryKeys.comments.counts(entityType, sorted),
    queryFn: () => commentService.counts(entityType, sorted),
    enabled: sorted.length > 0,
    placeholderData: (prev) => prev,
  });
}

export function useCreateComment(entityType: CommentEntityType, entityId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: string) => commentService.create({ entity_type: entityType, entity_id: entityId, body }),
    onSuccess: () => {
      // Prefix-matches both the detail thread and every cached counts query for this entity type.
      queryClient.invalidateQueries({ queryKey: queryKeys.comments.all(entityType) });
      toast.success("Comment added");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Couldn't add comment")),
  });
}

export function useDeleteComment(entityType: CommentEntityType) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => commentService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.comments.all(entityType) });
      toast.success("Comment deleted");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Couldn't delete comment")),
  });
}
