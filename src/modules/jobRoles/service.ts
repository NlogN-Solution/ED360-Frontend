import { apiClient } from "@/services/apiClient";
import type { JobRole, JobRoleCreatePayload, JobRoleUpdatePayload } from "./types";

export const jobRoleService = {
  async list(): Promise<JobRole[]> {
    const { data } = await apiClient.get<JobRole[]>("/job-roles");
    return data;
  },
  async create(payload: JobRoleCreatePayload): Promise<JobRole> {
    const { data } = await apiClient.post<JobRole>("/job-roles", payload);
    return data;
  },
  async update(id: string, payload: JobRoleUpdatePayload): Promise<JobRole> {
    const { data } = await apiClient.patch<JobRole>(`/job-roles/${id}`, payload);
    return data;
  },
  async remove(id: string): Promise<void> {
    await apiClient.delete(`/job-roles/${id}`);
  },
};
