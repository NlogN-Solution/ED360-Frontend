import { apiClient } from "@/services/apiClient";
import type {
  PlatformChangePlanPayload,
  PlatformOrganizationDetail,
  PlatformOrganizationList,
  PlatformOrganizationListParams,
  PlatformSubscriptionRead,
  UpdateOrganizationStatusPayload,
} from "./types";

export const platformService = {
  async listOrganizations(params: PlatformOrganizationListParams): Promise<PlatformOrganizationList> {
    const { data } = await apiClient.get<PlatformOrganizationList>("/platform/organizations", { params });
    return data;
  },

  async getOrganization(id: string): Promise<PlatformOrganizationDetail> {
    const { data } = await apiClient.get<PlatformOrganizationDetail>(`/platform/organizations/${id}`);
    return data;
  },

  async updateStatus(id: string, payload: UpdateOrganizationStatusPayload) {
    const { data } = await apiClient.patch(`/platform/organizations/${id}/status`, payload);
    return data;
  },

  async overridePlan(id: string, payload: PlatformChangePlanPayload): Promise<PlatformSubscriptionRead> {
    const { data } = await apiClient.post<PlatformSubscriptionRead>(`/platform/organizations/${id}/subscription/plan`, payload);
    return data;
  },

  async remove(id: string) {
    const { data } = await apiClient.delete(`/platform/organizations/${id}`);
    return data;
  },
};
