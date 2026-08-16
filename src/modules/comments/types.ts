import type { CommentEntityType } from "@/types/enums";

export interface CommentRead {
  id: string;
  entity_type: CommentEntityType;
  entity_id: string;
  author_id: string;
  body: string;
  created_at: string;
}

export interface CommentCreatePayload {
  entity_type: CommentEntityType;
  entity_id: string;
  body: string;
}

export interface CommentListResponse {
  items: CommentRead[];
  total: number;
}

export interface CommentCountsResponse {
  counts: Record<string, number>;
}
