import { useEffect, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { BarChart3, Download, LineChart, Loader2, Play, Save, Table as TableIcon } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable } from "@/components/shared/DataTable";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useCreateSavedReport, useExportReportCsv, useReportDatasets, useRunReportQuery } from "@/modules/reports/hooks";
import { ReportChart } from "@/modules/reports/ReportChart";
import { SavedReportsList } from "@/modules/reports/SavedReportsList";
import { formatCell } from "@/modules/reports/utils";
import type { ChartType, ReportQueryResult, SavedReport } from "@/modules/reports/types";

interface BuilderState {
  dataset: string;
  dimensions: string[];
  measures: string[];
  dateFrom: string;
  dateTo: string;
  filters: Record<string, string>;
  chartType: ChartType;
}

const EMPTY_STATE: BuilderState = {
  dataset: "",
  dimensions: [],
  measures: [],
  dateFrom: "",
  dateTo: "",
  filters: {},
  chartType: "table",
};

export function ReportsPage() {
  const { data: datasets, isLoading: datasetsLoading } = useReportDatasets();
  const runQuery = useRunReportQuery();
  const exportCsv = useExportReportCsv();
  const createSaved = useCreateSavedReport();

  const [tab, setTab] = useState<"builder" | "saved">("builder");
  const [builder, setBuilder] = useState<BuilderState>(EMPTY_STATE);
  const [result, setResult] = useState<ReportQueryResult | null>(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [saveName, setSaveName] = useState("");

  useEffect(() => {
    if (!datasets || datasets.length === 0 || builder.dataset) return;
    setBuilder((prev) => ({ ...prev, dataset: datasets[0].key }));
  }, [datasets, builder.dataset]);

  const activeDataset = datasets?.find((d) => d.key === builder.dataset);

  function updateDataset(key: string) {
    setBuilder({ ...EMPTY_STATE, dataset: key });
    setResult(null);
  }

  function toggleDimension(key: string) {
    setBuilder((prev) => ({
      ...prev,
      dimensions: prev.dimensions.includes(key) ? prev.dimensions.filter((d) => d !== key) : [...prev.dimensions, key],
    }));
  }

  function toggleMeasure(key: string) {
    setBuilder((prev) => ({
      ...prev,
      measures: prev.measures.includes(key) ? prev.measures.filter((m) => m !== key) : [...prev.measures, key],
    }));
  }

  function setFilter(key: string, value: string) {
    setBuilder((prev) => {
      const filters = { ...prev.filters };
      if (value === "__any__") delete filters[key];
      else filters[key] = value;
      return { ...prev, filters };
    });
  }

  function currentParams() {
    return {
      dataset: builder.dataset,
      dimensions: builder.dimensions,
      measures: builder.measures,
      date_from: builder.dateFrom || null,
      date_to: builder.dateTo || null,
      filters: builder.filters,
    };
  }

  function handleRun() {
    if (!builder.dataset || builder.measures.length === 0) return;
    runQuery.mutate(currentParams(), { onSuccess: setResult });
  }

  function handleLoadSaved(report: SavedReport) {
    setBuilder({
      dataset: report.dataset,
      dimensions: report.dimensions,
      measures: report.measures,
      dateFrom: report.date_from ?? "",
      dateTo: report.date_to ?? "",
      filters: report.filters,
      chartType: report.chart_type,
    });
    setResult(null);
    setTab("builder");
    runQuery.mutate(
      {
        dataset: report.dataset,
        dimensions: report.dimensions,
        measures: report.measures,
        date_from: report.date_from,
        date_to: report.date_to,
        filters: report.filters,
      },
      { onSuccess: setResult },
    );
  }

  function handleSave() {
    if (!saveName.trim()) return;
    createSaved.mutate(
      { name: saveName.trim(), ...currentParams(), chart_type: builder.chartType },
      { onSuccess: () => setSaveDialogOpen(false) },
    );
  }

  const tableColumns = useMemo<ColumnDef<Record<string, string | number | null>, any>[]>(() => {
    if (!result) return [];
    return result.columns.map((col) => ({
      id: col.key,
      accessorKey: col.key,
      header: col.label,
      cell: ({ getValue }: any) => (
        <span className={col.kind === "measure" ? "tabular-nums" : ""}>{formatCell(getValue(), col)}</span>
      ),
    }));
  }, [result]);

  const canRun = Boolean(builder.dataset && builder.measures.length > 0);

  return (
    <div>
      <PageHeader title="Reports" description="Build custom reports across your data — group, filter, chart, save, and export." />

      <Tabs value={tab} onValueChange={(v) => setTab(v as "builder" | "saved")}>
        <TabsList>
          <TabsTrigger value="builder">Builder</TabsTrigger>
          <TabsTrigger value="saved">Saved Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="builder" className="mt-4 space-y-4">
          {datasetsLoading ? (
            <Skeleton className="h-64 w-full rounded-xl" />
          ) : !datasets || datasets.length === 0 ? (
            <EmptyState icon={BarChart3} title="No reports available for your role" className="border-none py-16" />
          ) : (
            <>
              <div className="space-y-4 rounded-xl border border-border bg-card p-4">
                <div className="space-y-1.5">
                  <Label>Dataset</Label>
                  <Select value={builder.dataset} onValueChange={updateDataset}>
                    <SelectTrigger className="w-full sm:w-64">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {datasets.map((d) => (
                        <SelectItem key={d.key} value={d.key}>
                          {d.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {activeDataset && (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label>Group by</Label>
                      <div className="space-y-1.5 rounded-lg border border-border p-3">
                        {activeDataset.dimensions.map((dim) => (
                          <label key={dim.key} className="flex items-center gap-2 text-sm">
                            <Checkbox
                              checked={builder.dimensions.includes(dim.key)}
                              onCheckedChange={() => toggleDimension(dim.key)}
                            />
                            {dim.label}
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Measure</Label>
                      <div className="space-y-1.5 rounded-lg border border-border p-3">
                        {activeDataset.measures.map((measure) => (
                          <label key={measure.key} className="flex items-center gap-2 text-sm">
                            <Checkbox
                              checked={builder.measures.includes(measure.key)}
                              onCheckedChange={() => toggleMeasure(measure.key)}
                            />
                            {measure.label}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="space-y-1.5">
                    <Label>From</Label>
                    <Input type="date" value={builder.dateFrom} onChange={(e) => setBuilder((p) => ({ ...p, dateFrom: e.target.value }))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>To</Label>
                    <Input type="date" value={builder.dateTo} onChange={(e) => setBuilder((p) => ({ ...p, dateTo: e.target.value }))} />
                  </div>
                  {activeDataset?.dimensions
                    .filter((dim) => dim.options)
                    .map((dim) => (
                      <div key={dim.key} className="space-y-1.5">
                        <Label>Filter: {dim.label}</Label>
                        <Select value={builder.filters[dim.key] ?? "__any__"} onValueChange={(v) => setFilter(dim.key, v)}>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__any__">Any</SelectItem>
                            {dim.options!.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
                  <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
                    {(["table", "bar", "line"] as ChartType[]).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setBuilder((p) => ({ ...p, chartType: type }))}
                        className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                          builder.chartType === type ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {type === "table" && <TableIcon className="h-3.5 w-3.5" />}
                        {type === "bar" && <BarChart3 className="h-3.5 w-3.5" />}
                        {type === "line" && <LineChart className="h-3.5 w-3.5" />}
                        {type[0].toUpperCase() + type.slice(1)}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" disabled={!canRun} onClick={() => setSaveDialogOpen(true)}>
                      <Save className="h-3.5 w-3.5" /> Save
                    </Button>
                    <Button size="sm" disabled={!canRun || runQuery.isPending} onClick={handleRun}>
                      {runQuery.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
                      Run
                    </Button>
                  </div>
                </div>
              </div>

              {result && (
                <div className="space-y-4 rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[13px] font-semibold text-foreground">Results</p>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={exportCsv.isPending}
                      onClick={() => exportCsv.mutate(currentParams())}
                    >
                      {exportCsv.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                      Download CSV
                    </Button>
                  </div>

                  {builder.chartType !== "table" && <ReportChart result={result} chartType={builder.chartType} />}

                  {result.rows.length === 0 ? (
                    <EmptyState icon={BarChart3} title="No data for this selection" className="border-none py-12" />
                  ) : (
                    <DataTable columns={tableColumns} data={result.rows} getRowId={(row) => JSON.stringify(row)} />
                  )}
                </div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="saved" className="mt-4">
          <SavedReportsList onLoad={handleLoadSaved} />
        </TabsContent>
      </Tabs>

      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Save report</DialogTitle>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input value={saveName} onChange={(e) => setSaveName(e.target.value)} placeholder="e.g. Monthly lead funnel" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button disabled={!saveName.trim() || createSaved.isPending} onClick={handleSave}>
              {createSaved.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
