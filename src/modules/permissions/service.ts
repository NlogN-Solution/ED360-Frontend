import { apiClient } from "@/services/apiClient";
import type { PermissionMatrixResponse, PermissionUpdate } from "./types";

export const permissionService = {
  async getMatrix(): Promise<PermissionMatrixResponse> {
    const { data } = await apiClient.get<PermissionMatrixResponse>("/permissions");
    return data;
  },

  async updateMatrix(items: PermissionUpdate[]): Promise<PermissionMatrixResponse> {
    const { data } = await apiClient.put<PermissionMatrixResponse>("/permissions", { items });
    return data;
  },

  async resetToDefaults(): Promise<PermissionMatrixResponse> {
    const { data } = await apiClient.post<PermissionMatrixResponse>("/permissions/reset");
    return data;
  },
};
