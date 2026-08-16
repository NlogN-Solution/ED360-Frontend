import { useState, type ReactNode } from "react";
import {
  type ColumnDef,
  type RowSelectionState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DataTableProps<T> {
  columns: ColumnDef<T, any>[];
  data: T[];
  isLoading?: boolean;
  emptyState?: ReactNode;
  getRowId?: (row: T) => string;
  onRowClick?: (row: T) => void;
  selectable?: boolean;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: (selection: RowSelectionState) => void;
  columnVisibility?: VisibilityState;
  onColumnVisibilityChange?: (visibility: VisibilityState) => void;
  page?: number;
  limit?: number;
  total?: number;
  onPageChange?: (page: number) => void;
  /** Tighter row padding for dense, scan-heavy lists. Opt-in — default matches existing tables. */
  dense?: boolean;
  /** Pins the selection checkbox + first data column while the table scrolls horizontally. */
  stickyFirstColumn?: boolean;
}

const SELECT_COLUMN_WIDTH = 36;

export function DataTable<T>({
  columns,
  data,
  isLoading,
  emptyState,
  getRowId,
  onRowClick,
  selectable,
  rowSelection,
  onRowSelectionChange,
  columnVisibility,
  onColumnVisibilityChange,
  page = 1,
  limit = 20,
  total,
  onPageChange,
  dense,
  stickyFirstColumn,
}: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const allColumns: ColumnDef<T, any>[] = selectable
    ? [
        {
          id: "__select",
          size: 36,
          header: ({ table }) => (
            <Checkbox
              checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
              onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
              aria-label="Select all"
            />
          ),
          cell: ({ row }) => (
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(v) => row.toggleSelected(!!v)}
              onClick={(e) => e.stopPropagation()}
              aria-label="Select row"
            />
          ),
        },
        ...columns,
      ]
    : columns;

  const table = useReactTable({
    data,
    columns: allColumns,
    state: {
      sorting,
      rowSelection: rowSelection ?? {},
      columnVisibility: columnVisibility ?? {},
    },
    getRowId,
    enableRowSelection: selectable,
    onSortingChange: setSorting,
    onRowSelectionChange: (updater) => {
      if (!onRowSelectionChange) return;
      const next = typeof updater === "function" ? updater(rowSelection ?? {}) : updater;
      onRowSelectionChange(next);
    },
    onColumnVisibilityChange: (updater) => {
      if (!onColumnVisibilityChange) return;
      const next = typeof updater === "function" ? updater(columnVisibility ?? {}) : updater;
      onColumnVisibilityChange(next);
    },
    columnResizeMode: "onChange",
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const totalPages = total !== undefined ? Math.max(1, Math.ceil(total / limit)) : undefined;

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="max-h-[calc(100svh-260px)] overflow-auto rounded-t-xl">
        <Table style={{ width: table.getTotalSize() }}>
          <TableHeader className="sticky top-0 z-10 bg-card">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header, index) => {
                  const canSort = header.column.getCanSort();
                  const sortDir = header.column.getIsSorted();
                  const isStickyCol = stickyFirstColumn && (selectable ? index <= 1 : index === 0);
                  return (
                    <TableHead
                      key={header.id}
                      style={{
                        width: header.getSize(),
                        left: isStickyCol ? (selectable && index === 1 ? SELECT_COLUMN_WIDTH : 0) : undefined,
                      }}
                      className={cn(
                        "relative select-none whitespace-nowrap bg-card text-[12px] font-medium text-muted-foreground",
                        isStickyCol && "sticky z-20",
                      )}
                    >
                      {header.isPlaceholder ? null : canSort ? (
                        // Only sortable headers get the interactive wrapper — unsortable ones (like the
                        // selection checkbox column) render their content directly, since a <button> around
                        // a header that already contains an interactive control (e.g. the checkbox) nests
                        // interactive elements, which is invalid HTML and breaks screen-reader navigation.
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className="inline-flex cursor-pointer items-center gap-1 hover:text-foreground"
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {sortDir === "asc" ? (
                            <ArrowUp className="h-3 w-3" />
                          ) : sortDir === "desc" ? (
                            <ArrowDown className="h-3 w-3" />
                          ) : (
                            <ArrowUpDown className="h-3 w-3 opacity-40" />
                          )}
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </span>
                      )}
                      {header.column.getCanResize() && (
                        <div
                          onMouseDown={header.getResizeHandler()}
                          onTouchStart={header.getResizeHandler()}
                          className="absolute right-0 top-0 h-full w-1 cursor-col-resize touch-none select-none bg-transparent hover:bg-border"
                        />
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={allColumns.length} className="h-40 text-center">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={allColumns.length} className="p-0">
                  {emptyState ?? <div className="py-16 text-center text-sm text-muted-foreground">No results.</div>}
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  onClick={() => onRowClick?.(row.original)}
                  data-state={row.getIsSelected() && "selected"}
                  className={cn("group", onRowClick && "cursor-pointer")}
                >
                  {row.getVisibleCells().map((cell, index) => {
                    const isStickyCol = stickyFirstColumn && (selectable ? index <= 1 : index === 0);
                    return (
                      <TableCell
                        key={cell.id}
                        style={{
                          width: cell.column.getSize(),
                          left: isStickyCol ? (selectable && index === 1 ? SELECT_COLUMN_WIDTH : 0) : undefined,
                        }}
                        className={cn(
                          "text-[13px]",
                          dense ? "py-1.5" : undefined,
                          isStickyCol && "sticky z-[1] bg-card group-hover:bg-muted/50 group-data-[state=selected]:bg-muted",
                        )}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {total !== undefined && onPageChange && (
        <div className="flex items-center justify-between border-t border-border px-4 py-2.5">
          <p className="text-xs text-muted-foreground">
            {total === 0 ? "0 results" : `${(page - 1) * limit + 1}–${Math.min(page * limit, total)} of ${total}`}
          </p>
          <div className="flex items-center gap-1.5">
            <Button variant="outline" size="icon" className="h-7 w-7" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <span className="min-w-[70px] text-center text-xs tabular-nums text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              disabled={totalPages !== undefined && page >= totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
