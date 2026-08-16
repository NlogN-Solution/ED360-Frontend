import { apiClient } from "@/services/apiClient";
import type { ListResponse } from "@/types/api";
import type {
  Department,
  DepartmentCreatePayload,
  DepartmentListParams,
  DepartmentUpdatePayload,
  EmployeeDirectoryEntry,
  EmployeeDirectoryParams,
  Office,
  OfficeCreatePayload,
  OfficeListParams,
  OfficeUpdatePayload,
} from "./types";

export const departmentService = {
  async list(params: DepartmentListParams): Promise<ListResponse<Department>> {
    const { data } = await apiClient.get<ListResponse<Department>>("/departments", { params });
    return data;
  },
  async get(id: string): Promise<Department> {
    const { data } = await apiClient.get<Department>(`/departments/${id}`);
    return data;
  },
  async create(payload: DepartmentCreatePayload): Promise<Department> {
    const { data } = await apiClient.post<Department>("/departments", payload);
    return data;
  },
  async update(id: string, payload: DepartmentUpdatePayload): Promise<Department> {
    const { data } = await apiClient.patch<Department>(`/departments/${id}`, payload);
    return data;
  },
  async remove(id: string): Promise<Department> {
    const { data } = await apiClient.delete<Department>(`/departments/${id}`);
    return data;
  },
};

export const officeService = {
  async list(params: OfficeListParams): Promise<ListResponse<Office>> {
    const { data } = await apiClient.get<ListResponse<Office>>("/offices", { params });
    return data;
  },
  async get(id: string): Promise<Office> {
    const { data } = await apiClient.get<Office>(`/offices/${id}`);
    return data;
  },
  async create(payload: OfficeCreatePayload): Promise<Office> {
    const { data } = await apiClient.post<Office>("/offices", payload);
    return data;
  },
  async update(id: string, payload: OfficeUpdatePayload): Promise<Office> {
    const { data } = await apiClient.patch<Office>(`/offices/${id}`, payload);
    return data;
  },
  async remove(id: string): Promise<Office> {
    const { data } = await apiClient.delete<Office>(`/offices/${id}`);
    return data;
  },
};

export const employeeDirectoryService = {
  async list(params: EmployeeDirectoryParams): Promise<ListResponse<EmployeeDirectoryEntry>> {
    const { data } = await apiClient.get<ListResponse<EmployeeDirectoryEntry>>("/employees", { params });
    return data;
  },
};
