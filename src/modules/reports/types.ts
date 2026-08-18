export type MeasureFormat = "number" | "currency" | "hours" | "days";
export type ChartType = "table" | "bar" | "line";

export interface DimensionOption {
  value: string;
  label: string;
}

export interface DatasetDimension {
  key: string;
  label: string;
  options: DimensionOption[] | null;
}

export interface DatasetMeasure {
  key: string;
  label: string;
  format: MeasureFormat;
}

export interface DatasetMeta {
  key: string;
  label: string;
  dimensions: DatasetDimension[];
  measures: DatasetMeasure[];
}

export interface ReportQueryParams {
  dataset: string;
  dimensions: string[];
  measures: string[];
  date_from?: string | null;
  date_to?: string | null;
  filters: Record<string, string>;
}

export interface ReportColumn {
  key: string;
  label: string;
  kind: "dimension" | "measure";
  format: "text" | MeasureFormat;
}

export interface ReportQueryResult {
  columns: ReportColumn[];
  rows: Record<string, string | number | null>[];
}

export interface SavedReport {
  id: string;
  organization_id: string | null;
  name: string;
  dataset: string;
  dimensions: string[];
  measures: string[];
  date_from: string | null;
  date_to: string | null;
  filters: Record<string, string>;
  chart_type: ChartType;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface SavedReportCreatePayload {
  name: string;
  dataset: string;
  dimensions: string[];
  measures: string[];
  date_from?: string | null;
  date_to?: string | null;
  filters: Record<string, string>;
  chart_type: ChartType;
}

export type SavedReportUpdatePayload = Partial<SavedReportCreatePayload>;
