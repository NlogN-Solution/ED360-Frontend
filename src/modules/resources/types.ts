import type { ResourceType } from "@/types/enums";

export interface Resource {
  id: string;
  organization_id: string | null;
  type: ResourceType;
  title: string;
  description: string | null;
  category: string | null;
  body: string | null;
  file_url: string | null;
  original_file_name: string | null;
  mime_type: string | null;
  file_size: number | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ResourceArticleCreatePayload {
  title: string;
  description?: string | null;
  category?: string | null;
  body: string;
}

export interface ResourceUpdatePayload {
  title?: string;
  description?: string | null;
  category?: string | null;
  body?: string | null;
}

export interface ResourceListParams {
  page?: number;
  limit?: number;
  category?: string;
  type?: ResourceType;
  search?: string;
}
