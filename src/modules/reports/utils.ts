import { formatCurrency, formatNumber } from "@/utils/format";
import type { ReportColumn } from "./types";

export function formatCell(value: string | number | null, column: ReportColumn): string {
  if (value === null || value === undefined) return "—";
  if (column.kind === "dimension") return String(value);
  const num = Number(value);
  switch (column.format) {
    case "currency":
      return formatCurrency(num);
    case "hours":
      return `${formatNumber(num)} hrs`;
    case "days":
      return `${formatNumber(num)} days`;
    default:
      return formatNumber(num);
  }
}
