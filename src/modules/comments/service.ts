import { apiClient } from "@/services/apiClient";
import type { CommentEntityType } from "@/types/enums";
import type { CommentCountsResponse, CommentCreatePayload, CommentListResponse, CommentRead } from "./types";

export const commentService = {
  async list(entityType: CommentEntityType, entityId: string): Promise<CommentListResponse> {
    const { data } = await apiClient.get<CommentListResponse>("/comments", {
      params: { entity_type: entityType, entity_id: entityId },
    });
    return data;
  },

  async counts(entityType: CommentEntityType, entityIds: string[]): Promise<CommentCountsResponse> {
    if (entityIds.length === 0) return { counts: {} };
    const { data } = await apiClient.get<CommentCountsResponse>("/comments/counts", {
      params: { entity_type: entityType, entity_ids: entityIds.join(",") },
    });
    return data;
  },

  async create(payload: CommentCreatePayload): Promise<CommentRead> {
    const { data } = await apiClient.post<CommentRead>("/comments", payload);
    return data;
  },

  async remove(id: string): Promise<CommentRead> {
    const { data } = await apiClient.delete<CommentRead>(`/comments/${id}`);
    return data;
  },
};
