import { useMemo, useState } from "react";
import { CheckCircle2, CircleAlert } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { useDutyAcknowledgements } from "./hooks";
import { formatDateTime } from "@/utils/format";

export function DutyAcknowledgementDialog({
  dutyId,
  dutyTitle,
  open,
  onOpenChange,
}: {
  dutyId: string | null;
  dutyTitle: string | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data, isLoading } = useDutyAcknowledgements(dutyId ?? undefined);
  const [filter, setFilter] = useState<"all" | "acknowledged" | "pending">("all");

  const statuses = useMemo(() => {
    const all = data?.statuses ?? [];
    if (filter === "acknowledged") return all.filter((s) => s.acknowledged);
    if (filter === "pending") return all.filter((s) => !s.acknowledged);
    return all;
  }, [data, filter]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{dutyTitle ?? "Acknowledgements"}</DialogTitle>
        </DialogHeader>

        {isLoading || !data ? (
          <Skeleton className="h-48 w-full rounded-lg" />
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{data.total_acknowledged}</span> / {data.total_applicable} acknowledged — version{" "}
              {data.version}
            </p>

            <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="acknowledged">Acknowledged</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
              </TabsList>
            </Tabs>

            {statuses.length === 0 ? (
              <EmptyState icon={CheckCircle2} title="No one to show" className="border-none py-10" />
            ) : (
              <div className="max-h-80 space-y-1 overflow-y-auto">
                {statuses.map((status) => (
                  <div key={status.user.id} className="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm">
                    <span className="text-foreground">
                      {status.user.first_name} {status.user.last_name}
                    </span>
                    {status.acknowledged ? (
                      <span className="flex items-center gap-1.5 text-xs text-success">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {status.acknowledged_at ? formatDateTime(status.acknowledged_at) : "Acknowledged"}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-xs text-warning">
                        <CircleAlert className="h-3.5 w-3.5" />
                        Pending
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
