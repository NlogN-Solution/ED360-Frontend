import { useState } from "react";
import { BarChart3, LineChart, Play, Table as TableIcon, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useDeleteSavedReport, useReportDatasets, useSavedReports } from "./hooks";
import type { SavedReport } from "./types";
import { formatDateTime } from "@/utils/format";

const CHART_ICONS = { table: TableIcon, bar: BarChart3, line: LineChart };

export function SavedReportsList({ onLoad }: { onLoad: (report: SavedReport) => void }) {
  const { data, isLoading } = useSavedReports();
  const { data: datasets } = useReportDatasets();
  const deleteReport = useDeleteSavedReport();
  const [deleting, setDeleting] = useState<SavedReport | null>(null);

  const datasetLabel = (key: string) => datasets?.find((d) => d.key === key)?.label ?? key;

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  const reports = data?.items ?? [];
  if (reports.length === 0) {
    return <EmptyState icon={TableIcon} title="No saved reports yet" description="Build one and save it to see it here." className="border-none py-16" />;
  }

  return (
    <>
      <div className="space-y-2">
        {reports.map((report) => {
          const Icon = CHART_ICONS[report.chart_type];
          return (
            <div key={report.id} className="flex items-center justify-between rounded-lg border border-border p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{report.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {datasetLabel(report.dataset)} · {formatDateTime(report.created_at)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => onLoad(report)}>
                  <Play className="h-3.5 w-3.5" /> Open
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-danger"
                  onClick={() => setDeleting(report)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete this saved report?"
        description={`"${deleting?.name}" will be removed. This can't be undone.`}
        confirmLabel="Delete"
        destructive
        isPending={deleteReport.isPending}
        onConfirm={() => deleting && deleteReport.mutate(deleting.id, { onSuccess: () => setDeleting(null) })}
      />
    </>
  );
}
