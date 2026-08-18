import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/constants/queryKeys";
import { getErrorMessage } from "@/utils/errors";
import { reportService } from "./service";
import type { ReportQueryParams, SavedReportCreatePayload, SavedReportUpdatePayload } from "./types";

export function useReportDatasets() {
  return useQuery({
    queryKey: queryKeys.reports.datasets,
    queryFn: () => reportService.listDatasets(),
  });
}

export function useRunReportQuery() {
  return useMutation({
    mutationFn: (params: ReportQueryParams) => reportService.runQuery(params),
    onError: (error) => toast.error(getErrorMessage(error, "Couldn't run report")),
  });
}

export function useExportReportCsv() {
  return useMutation({
    mutationFn: (params: ReportQueryParams) => reportService.exportCsv(params),
    onError: (error) => toast.error(getErrorMessage(error, "Couldn't export report")),
  });
}

export function useSavedReports() {
  return useQuery({
    queryKey: queryKeys.reports.saved,
    queryFn: () => reportService.listSaved(),
  });
}

function useInvalidateSavedReports() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: queryKeys.reports.saved });
}

export function useCreateSavedReport() {
  const invalidate = useInvalidateSavedReports();
  return useMutation({
    mutationFn: (payload: SavedReportCreatePayload) => reportService.createSaved(payload),
    onSuccess: () => {
      invalidate();
      toast.success("Report saved");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Couldn't save report")),
  });
}

export function useUpdateSavedReport(id: string) {
  const invalidate = useInvalidateSavedReports();
  return useMutation({
    mutationFn: (payload: SavedReportUpdatePayload) => reportService.updateSaved(id, payload),
    onSuccess: () => {
      invalidate();
      toast.success("Report updated");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Couldn't update report")),
  });
}

export function useDeleteSavedReport() {
  const invalidate = useInvalidateSavedReports();
  return useMutation({
    mutationFn: (id: string) => reportService.deleteSaved(id),
    onSuccess: () => {
      invalidate();
      toast.success("Report deleted");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Couldn't delete report")),
  });
}

export function useRunSavedReport() {
  return useMutation({
    mutationFn: (id: string) => reportService.runSaved(id),
    onError: (error) => toast.error(getErrorMessage(error, "Couldn't run saved report")),
  });
}
