import type { ColumnDef } from "@tanstack/react-table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DataTable } from "@/components/shared/DataTable";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Users } from "lucide-react";
import { useSegmentPreview } from "./hooks";
import type { SegmentLead } from "./types";

export function SegmentPreviewDialog({
  segmentId,
  segmentName,
  open,
  onOpenChange,
}: {
  segmentId: string | null;
  segmentName: string | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data, isLoading } = useSegmentPreview(segmentId ?? undefined, 1);

  const columns: ColumnDef<SegmentLead, any>[] = [
    {
      id: "name",
      header: "Name",
      cell: ({ row }) => (
        <span className="text-foreground">
          {row.original.first_name} {row.original.last_name ?? ""}
        </span>
      ),
    },
    { accessorKey: "phone", header: "Phone" },
    { accessorKey: "status", header: "Status", cell: ({ getValue }) => <StatusBadge status={getValue<string>()} /> },
    { accessorKey: "source", header: "Source", cell: ({ getValue }) => <StatusBadge status={getValue<string>()} /> },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{segmentName ?? "Segment preview"}</DialogTitle>
        </DialogHeader>
        <DataTable
          columns={columns}
          data={data?.items ?? []}
          isLoading={isLoading}
          getRowId={(row) => row.id}
          emptyState={<EmptyState icon={Users} title="No matching leads" className="border-none py-14" />}
        />
        {data && data.total > (data.items?.length ?? 0) && (
          <p className="text-xs text-muted-foreground">Showing {data.items.length} of {data.total} matching leads.</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
