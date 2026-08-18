import { apiClient } from "@/services/apiClient";
import type {
  AudienceSegment,
  AudienceSegmentCreatePayload,
  AudienceSegmentUpdatePayload,
  SegmentFilters,
  SegmentPreview,
} from "./types";

export const audienceSegmentService = {
  async list(): Promise<{ items: AudienceSegment[] }> {
    const { data } = await apiClient.get<{ items: AudienceSegment[] }>("/marketing/segments");
    return data;
  },
  async get(id: string): Promise<AudienceSegment> {
    const { data } = await apiClient.get<AudienceSegment>(`/marketing/segments/${id}`);
    return data;
  },
  async create(payload: AudienceSegmentCreatePayload): Promise<AudienceSegment> {
    const { data } = await apiClient.post<AudienceSegment>("/marketing/segments", payload);
    return data;
  },
  async update(id: string, payload: AudienceSegmentUpdatePayload): Promise<AudienceSegment> {
    const { data } = await apiClient.patch<AudienceSegment>(`/marketing/segments/${id}`, payload);
    return data;
  },
  async remove(id: string): Promise<void> {
    await apiClient.delete(`/marketing/segments/${id}`);
  },
  async previewSaved(id: string, page = 1, limit = 20): Promise<SegmentPreview> {
    const { data } = await apiClient.get<SegmentPreview>(`/marketing/segments/${id}/preview`, { params: { page, limit } });
    return data;
  },
  async previewFilters(filters: SegmentFilters, page = 1, limit = 20): Promise<SegmentPreview> {
    const { data } = await apiClient.post<SegmentPreview>("/marketing/segments/preview", filters, { params: { page, limit } });
    return data;
  },
};
