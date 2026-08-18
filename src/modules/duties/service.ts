import { apiClient } from "@/services/apiClient";
import type { ListResponse } from "@/types/api";
import type {
  AcknowledgementStatus,
  Duty,
  DutyAcknowledgementSummary,
  DutyCreatePayload,
  DutyListParams,
  DutyUpdatePayload,
  DutyVersion,
} from "./types";

export const dutyService = {
  async list(params: DutyListParams): Promise<ListResponse<Duty>> {
    const { data } = await apiClient.get<ListResponse<Duty>>("/duties", { params });
    return data;
  },
  async listMine(): Promise<ListResponse<Duty>> {
    const { data } = await apiClient.get<ListResponse<Duty>>("/duties/my");
    return data;
  },
  async listMinePending(): Promise<ListResponse<Duty>> {
    const { data } = await apiClient.get<ListResponse<Duty>>("/duties/my/pending");
    return data;
  },
  async get(id: string): Promise<Duty> {
    const { data } = await apiClient.get<Duty>(`/duties/${id}`);
    return data;
  },
  async create(payload: DutyCreatePayload): Promise<Duty> {
    const { data } = await apiClient.post<Duty>("/duties", payload);
    return data;
  },
  async update(id: string, payload: DutyUpdatePayload): Promise<Duty> {
    const { data } = await apiClient.patch<Duty>(`/duties/${id}`, payload);
    return data;
  },
  async remove(id: string): Promise<void> {
    await apiClient.delete(`/duties/${id}`);
  },
  async publish(id: string): Promise<Duty> {
    const { data } = await apiClient.post<Duty>(`/duties/${id}/publish`);
    return data;
  },
  async archive(id: string): Promise<Duty> {
    const { data } = await apiClient.post<Duty>(`/duties/${id}/archive`);
    return data;
  },
  async listVersions(id: string): Promise<DutyVersion[]> {
    const { data } = await apiClient.get<DutyVersion[]>(`/duties/${id}/versions`);
    return data;
  },
  async createVersion(id: string, title: string | null, content: string | null): Promise<DutyVersion> {
    const { data } = await apiClient.post<DutyVersion>(`/duties/${id}/versions`, { title, content });
    return data;
  },
  async publishVersion(id: string, version: number): Promise<Duty> {
    const { data } = await apiClient.post<Duty>(`/duties/${id}/versions/${version}/publish`);
    return data;
  },
  async acknowledge(id: string): Promise<AcknowledgementStatus> {
    const { data } = await apiClient.post<AcknowledgementStatus>(`/duties/${id}/acknowledge`);
    return data;
  },
  async getAcknowledgements(id: string): Promise<DutyAcknowledgementSummary> {
    const { data } = await apiClient.get<DutyAcknowledgementSummary>(`/duties/${id}/acknowledgements`);
    return data;
  },
};
