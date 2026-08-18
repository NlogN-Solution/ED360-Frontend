import { apiClient } from "@/services/apiClient";
import type {
  DatasetMeta,
  ReportQueryParams,
  ReportQueryResult,
  SavedReport,
  SavedReportCreatePayload,
  SavedReportUpdatePayload,
} from "./types";

export const reportService = {
  async listDatasets(): Promise<DatasetMeta[]> {
    const { data } = await apiClient.get<DatasetMeta[]>("/reports/datasets");
    return data;
  },
  async runQuery(params: ReportQueryParams): Promise<ReportQueryResult> {
    const { data } = await apiClient.post<ReportQueryResult>("/reports/query", params);
    return data;
  },
  async exportCsv(params: ReportQueryParams): Promise<void> {
    const response = await apiClient.post("/reports/query/export", params, { responseType: "blob" });
    const url = URL.createObjectURL(new Blob([response.data], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${params.dataset}-report.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  },
  async listSaved(): Promise<{ items: SavedReport[] }> {
    const { data } = await apiClient.get<{ items: SavedReport[] }>("/reports/saved");
    return data;
  },
  async createSaved(payload: SavedReportCreatePayload): Promise<SavedReport> {
    const { data } = await apiClient.post<SavedReport>("/reports/saved", payload);
    return data;
  },
  async updateSaved(id: string, payload: SavedReportUpdatePayload): Promise<SavedReport> {
    const { data } = await apiClient.patch<SavedReport>(`/reports/saved/${id}`, payload);
    return data;
  },
  async deleteSaved(id: string): Promise<void> {
    await apiClient.delete(`/reports/saved/${id}`);
  },
  async runSaved(id: string): Promise<ReportQueryResult> {
    const { data } = await apiClient.post<ReportQueryResult>(`/reports/saved/${id}/run`);
    return data;
  },
};
