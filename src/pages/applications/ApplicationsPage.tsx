import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import type { ColumnDef } from "@tanstack/react-table";
import { FileText, Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { ListToolbar } from "@/components/shared/ListToolbar";
import { DataTable } from "@/components/shared/DataTable";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDebounce } from "@/hooks/useDebounce";
import { useQueryFlagDialog } from "@/hooks/useQueryFlagDialog";
import { useApplications } from "@/modules/applications/hooks";
import { ApplicationFormDialog } from "@/modules/applications/ApplicationFormDialog";
import type { ApplicationRead } from "@/modules/applications/types";
import { StudentNameCell } from "@/modules/users/StudentNameCell";
import { ProgramNameCell } from "@/modules/academic/ProgramNameCell";
import { useAuthStore } from "@/services/authStore";
import { CommentBadge } from "@/modules/comments/CommentBadge";
import { useCommentCounts } from "@/modules/comments/hooks";
import { ApplicationStatus, CommentEntityType, UserRole } from "@/types/enums";
import { formatCurrency, formatDate, toTitleCase } from "@/utils/format";

export function ApplicationsPage() {
  const navigate = useNavigate();
  const role = useAuthStore((s) => s.user?.role);
  const isStudent = role === UserRole.STUDENT;
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useQueryFlagDialog();
  const debouncedSearch = useDebounce(search);

  const params = useMemo(
    () => ({
      page,
      limit: 20,
      search: debouncedSearch || undefined,
      status: status === "all" ? undefined : (status as ApplicationStatus),
    }),
    [page, debouncedSearch, status],
  );
  const { data, isLoading } = useApplications(params);
  const applicationIds = useMemo(() => (data?.items ?? []).map((a) => a.id), [data]);
  // Comments are a staff-only tool — never fetched or rendered for the student portal.
  const { data: commentCounts } = useCommentCounts(CommentEntityType.APPLICATION, isStudent ? [] : applicationIds);

  const columns = useMemo<ColumnDef<ApplicationRead, any>[]>(() => {
    const cols: ColumnDef<ApplicationRead, any>[] = [
      { accessorKey: "student_id", header: "Applicant", cell: ({ getValue }) => <StudentNameCell userId={getValue<string>()} /> },
      { accessorKey: "program_id", header: "Course", cell: ({ getValue }) => <ProgramNameCell programId={getValue<string>()} /> },
      { accessorKey: "status", header: "Status", cell: ({ getValue }) => <StatusBadge status={getValue<string>()} /> },
      {
        accessorKey: "tuition_fee",
        header: "Tuition",
        cell: ({ getValue }) => {
          const v = getValue<number>();
          return v ? <span className="tabular-nums">{formatCurrency(v)}</span> : "—";
        },
      },
      {
        accessorKey: "application_date",
        header: "Applied",
        cell: ({ getValue }) => <span className="text-muted-foreground">{formatDate(getValue<string>())}</span>,
      },
      {
        accessorKey: "created_at",
        header: "Created",
        cell: ({ getValue }) => <span className="text-muted-foreground">{formatDate(getValue<string>())}</span>,
      },
    ];
    // Comments are a staff-only tool — the column never renders on the student portal.
    if (!isStudent) {
      cols.push({
        id: "__comments",
        header: "Comments",
        size: 90,
        cell: ({ row }) => (
          <CommentBadge
            entityType={CommentEntityType.APPLICATION}
            entityId={row.original.id}
            count={commentCounts?.counts[row.original.id] ?? 0}
            detailPath={`/applications/${row.original.id}#comments`}
          />
        ),
      });
    }
    return cols;
  }, [isStudent, commentCounts]);

  return (
    <div>
      <PageHeader
        title="Applications"
        description="University applications moving through your pipeline."
        actions={
          !isStudent && (
            <Button size="sm" onClick={() => setDialogOpen(true)}>
              <Plus className="h-3.5 w-3.5" />
              New application
            </Button>
          )
        }
      />

      <div className="mb-3">
        <ListToolbar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search by applicant or course…"
          filters={
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger size="sm" className="h-8 w-[170px] text-xs">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {Object.values(ApplicationStatus).map((s) => (
                  <SelectItem key={s} value={s}>
                    {toTitleCase(s)}
                  </SelectItem>
                ))}
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
        onRowClick={(row) => navigate(`/applications/${row.id}`)}
        page={page}
        limit={20}
        total={data?.total}
        onPageChange={setPage}
        emptyState={
          <EmptyState
            icon={FileText}
            title="No applications yet"
            description="Start one once an applicant is ready to apply to a course."
            action={
              !isStudent && (
                <Button size="sm" onClick={() => setDialogOpen(true)}>
                  <Plus className="h-3.5 w-3.5" /> Create application
                </Button>
              )
            }
            className="border-none py-20"
          />
        }
      />

      <ApplicationFormDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
