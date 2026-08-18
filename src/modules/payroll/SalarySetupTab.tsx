import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { UserCog } from "lucide-react";
import { DataTable } from "@/components/shared/DataTable";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { useEmployeeDirectory } from "@/modules/people/hooks";
import type { EmployeeDirectoryEntry } from "@/modules/people/types";
import { useMissingSalaryEmployees } from "./hooks";
import { EmployeeSalarySetupDialog } from "./EmployeeSalarySetupDialog";

export function SalarySetupTab() {
  const [page, setPage] = useState(1);
  const [selectedEmployee, setSelectedEmployee] = useState<{ id: string; name: string } | null>(null);
  const { data: directory, isLoading } = useEmployeeDirectory({ page, limit: 20 });
  const { data: missingSalary } = useMissingSalaryEmployees();
  const missingIds = useMemo(() => new Set((missingSalary ?? []).map((e) => e.id)), [missingSalary]);

  const columns: ColumnDef<EmployeeDirectoryEntry, any>[] = [
    {
      id: "name",
      header: "Employee",
      cell: ({ row }) => (
        <span className="text-foreground">
          {row.original.first_name} {row.original.last_name}
        </span>
      ),
    },
    { accessorKey: "designation", header: "Designation", cell: ({ getValue }) => getValue<string>() ?? "—" },
    {
      id: "salaryStatus",
      header: "Salary",
      cell: ({ row }) =>
        missingIds.has(row.original.id) ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-warning">
            <span className="h-1.5 w-1.5 rounded-full bg-warning" /> Not set
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-success">
            <span className="h-1.5 w-1.5 rounded-full bg-success" /> Set
          </span>
        ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            setSelectedEmployee({ id: row.original.id, name: `${row.original.first_name} ${row.original.last_name}` })
          }
        >
          Manage
        </Button>
      ),
    },
  ];

  return (
    <div>
      <p className="mb-3 text-xs text-muted-foreground">
        Set each employee's basic salary, bank details, and any recurring tax/PF/allowance items — these apply automatically
        the next time you generate a payroll run.
      </p>
      <DataTable
        columns={columns}
        data={directory?.items ?? []}
        isLoading={isLoading}
        getRowId={(row) => row.id}
        page={page}
        limit={20}
        total={directory?.total}
        onPageChange={setPage}
        emptyState={<EmptyState icon={UserCog} title="No employees yet" className="border-none py-14" />}
      />
      <EmployeeSalarySetupDialog
        employee={selectedEmployee}
        open={selectedEmployee !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedEmployee(null);
        }}
      />
    </div>
  );
}
