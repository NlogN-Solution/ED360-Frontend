import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ChartType, ReportColumn, ReportQueryResult } from "./types";

const SERIES_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

export function ReportChart({ result, chartType }: { result: ReportQueryResult; chartType: ChartType }) {
  const dimensionColumns = result.columns.filter((c) => c.kind === "dimension");
  const measureColumns = result.columns.filter((c) => c.kind === "measure");

  if (dimensionColumns.length !== 1) {
    return (
      <div className="flex h-56 items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
        Charts need exactly one "Group by" field selected — showing the table below instead.
      </div>
    );
  }

  const xKey = dimensionColumns[0].key;
  const ChartComponent = chartType === "line" ? LineChart : BarChart;

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ChartComponent data={result.rows} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
          <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} allowDecimals={false} />
          <Tooltip
            cursor={chartType === "bar" ? { fill: "var(--muted)" } : undefined}
            contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
          />
          {measureColumns.length > 1 && <Legend wrapperStyle={{ fontSize: 11 }} />}
          {measureColumns.map((measure: ReportColumn, i: number) =>
            chartType === "line" ? (
              <Line
                key={measure.key}
                type="monotone"
                dataKey={measure.key}
                name={measure.label}
                stroke={SERIES_COLORS[i % SERIES_COLORS.length]}
                strokeWidth={2}
                dot={false}
              />
            ) : (
              <Bar
                key={measure.key}
                dataKey={measure.key}
                name={measure.label}
                fill={SERIES_COLORS[i % SERIES_COLORS.length]}
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
            ),
          )}
        </ChartComponent>
      </ResponsiveContainer>
    </div>
  );
}
