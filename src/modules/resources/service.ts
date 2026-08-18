import { apiClient } from "@/services/apiClient";
import type { ListResponse } from "@/types/api";
import type { Resource, ResourceArticleCreatePayload, ResourceListParams, ResourceUpdatePayload } from "./types";

export const resourceService = {
  async list(params: ResourceListParams): Promise<ListResponse<Resource>> {
    const { data } = await apiClient.get<ListResponse<Resource>>("/resources", { params });
    return data;
  },
  async get(id: string): Promise<Resource> {
    const { data } = await apiClient.get<Resource>(`/resources/${id}`);
    return data;
  },
  async createArticle(payload: ResourceArticleCreatePayload): Promise<Resource> {
    const { data } = await apiClient.post<Resource>("/resources/articles", payload);
    return data;
  },
  async uploadFile(
    file: File,
    meta: { title?: string; description?: string; category?: string },
  ): Promise<Resource> {
    const form = new FormData();
    form.append("file", file);
    if (meta.title) form.append("title", meta.title);
    if (meta.description) form.append("description", meta.description);
    if (meta.category) form.append("category", meta.category);
    const { data } = await apiClient.post<Resource>("/resources/files", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },
  async update(id: string, payload: ResourceUpdatePayload): Promise<Resource> {
    const { data } = await apiClient.patch<Resource>(`/resources/${id}`, payload);
    return data;
  },
  async remove(id: string): Promise<void> {
    await apiClient.delete(`/resources/${id}`);
  },
};
