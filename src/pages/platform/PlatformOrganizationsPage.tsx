import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Building } from "lucide-react";
import { useNavigate } from "react-router";
import { PageHeader } from "@/components/shared/PageHeader";
import { ListToolbar } from "@/components/shared/ListToolbar";
import { DataTable } from "@/components/shared/DataTable";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDebounce } from "@/hooks/useDebounce";
import { usePlatformOrganizations } from "@/modules/platform/hooks";
import type { OrganizationStatus, PlatformOrganizationRead } from "@/modules/platform/types";
import { toTitleCase } from "@/utils/format";

const PLAN_LABELS: Record<string, string> = {
  starter: "Starter",
  professional: "Professional",
  enterprise: "Enterprise",
};

export function PlatformOrganizationsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search);

  const params = useMemo(
    () => ({
      page,
      limit: 20,
      search: debouncedSearch || undefined,
      status: status === "all" ? undefined : (status as OrganizationStatus),
    }),
    [page, debouncedSearch, status],
  );
  const { data, isLoading } = usePlatformOrganizations(params);

  const columns = useMemo<ColumnDef<PlatformOrganizationRead, any>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Organization",
        cell: ({ row }) => (
          <div>
            <p className="font-medium text-foreground">{row.original.name}</p>
            <p className="text-xs text-muted-foreground">{row.original.slug}</p>
          </div>
        ),
      },
      { accessorKey: "status", header: "Status", cell: ({ getValue }) => <StatusBadge status={getValue<string>()} /> },
      {
        accessorKey: "plan",
        header: "Plan",
        cell: ({ getValue }) => {
          const plan = getValue<string | null>();
          return plan ? PLAN_LABELS[plan] ?? toTitleCase(plan) : "—";
        },
      },
      {
        id: "seats",
        header: "Staff seats",
        cell: ({ row }) => {
          const { staff_used, staff_limit } = row.original.usage;
          return (
            <span className="tabular-nums text-muted-foreground">
              {staff_used} {staff_limit !== null ? `/ ${staff_limit}` : "(unlimited)"}
            </span>
          );
        },
      },
      {
        id: "students",
        header: "Students",
        cell: ({ row }) => {
          const { student_used, student_limit } = row.original.usage;
          return (
            <span className="tabular-nums text-muted-foreground">
              {student_used} {student_limit !== null ? `/ ${student_limit}` : "(unlimited)"}
            </span>
          );
        },
      },
    ],
    [],
  );

  return (
    <div>
      <PageHeader title="Organizations" description="Every organization on the platform." />

      <div className="mb-3">
        <ListToolbar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search by name or URL…"
          filters={
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger size="sm" className="h-8 w-[140px] text-xs">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="trial">Trial</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          }
        />
      </div>

      <DataTable
        columns={columns}
        data={data?.items ?? []}
        isLoading={isLoading}
        getRowId={(row) => row.id}
        page={page}
        limit={20}
        total={data?.total}
        onPageChange={setPage}
        onRowClick={(row) => navigate(`/platform/organizations/${row.id}`)}
        emptyState={<EmptyState icon={Building} title="No organizations found" description="Try a different search or filter." className="border-none py-20" />}
      />
    </div>
  );
}
