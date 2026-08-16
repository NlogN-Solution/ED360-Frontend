import { useEffect, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Building, Loader2, MoreHorizontal, Plus, Star, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { ListToolbar } from "@/components/shared/ListToolbar";
import { DataTable } from "@/components/shared/DataTable";
import { EmptyState } from "@/components/shared/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDebounce } from "@/hooks/useDebounce";
import { useQueryFlagDialog } from "@/hooks/useQueryFlagDialog";
import { useCreateOffice, useDeleteOffice, useOffices, useUpdateOffice } from "@/modules/people/hooks";
import type { Office } from "@/modules/people/types";

function OfficeFormDialog({ office, open, onOpenChange }: { office: Office | null; open: boolean; onOpenChange: (open: boolean) => void }) {
  const isEdit = Boolean(office);
  const create = useCreateOffice();
  const update = useUpdateOffice(office?.id ?? "");
  const [name, setName] = useState("");
  const [isHeadquarters, setIsHeadquarters] = useState(false);
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (open) {
      setName(office?.name ?? "");
      setIsHeadquarters(office?.is_headquarters ?? false);
      setCity(office?.city ?? "");
      setAddress(office?.address ?? "");
      setIsActive(office?.is_active ?? true);
    }
  }, [open, office]);

  const isPending = create.isPending || update.isPending;

  function handleSubmit() {
    if (!name.trim()) return;
    const payload = {
      name: name.trim(),
      is_headquarters: isHeadquarters,
      city: city || undefined,
      address: address || undefined,
      is_active: isActive,
    };
    if (isEdit) {
      update.mutate(payload, { onSuccess: () => onOpenChange(false) });
    } else {
      create.mutate(payload, { onSuccess: () => onOpenChange(false) });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit office" : "New office"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Kathmandu Headquarters" />
          </div>
          <div className="space-y-1.5">
            <Label>City</Label>
            <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Kathmandu" />
          </div>
          <div className="space-y-1.5">
            <Label>Address (optional)</Label>
            <Input value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <Label className="cursor-pointer">Headquarters</Label>
            <Switch checked={isHeadquarters} onCheckedChange={setIsHeadquarters} />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <Label className="cursor-pointer">Active</Label>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={!name.trim() || isPending} onClick={handleSubmit}>
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {isEdit ? "Save" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function OfficesPage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useQueryFlagDialog();
  const [editing, setEditing] = useState<Office | null>(null);
  const remove = useDeleteOffice();

  const params = useMemo(() => ({ page, limit: 20, search: debouncedSearch || undefined }), [page, debouncedSearch]);
  const { data, isLoading } = useOffices(params);

  const columns = useMemo<ColumnDef<Office, any>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Office",
        cell: ({ row }) => (
          <span className="flex items-center gap-1.5">
            <span className="line-clamp-1 font-medium text-foreground">{row.original.name}</span>
            {row.original.is_headquarters && (
              <Badge variant="secondary" className="shrink-0 gap-1">
                <Star className="h-3 w-3" /> HQ
              </Badge>
            )}
            {!row.original.is_active && (
              <Badge variant="outline" className="shrink-0">
                Inactive
              </Badge>
            )}
          </span>
        ),
      },
      {
        accessorKey: "city",
        header: "City",
        cell: ({ getValue }) => <span className="line-clamp-1 text-muted-foreground">{getValue<string>() || "—"}</span>,
      },
      {
        accessorKey: "employee_count",
        header: "Staff",
        cell: ({ getValue }) => <span className="tabular-nums text-foreground">{getValue<number>()}</span>,
      },
      {
        id: "actions",
        header: "",
        size: 48,
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => e.stopPropagation()}>
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              <DropdownMenuItem onSelect={() => setEditing(row.original)}>Edit</DropdownMenuItem>
              <DropdownMenuItem
                className="text-danger focus:text-danger"
                onSelect={() => {
                  if (confirm(`Delete "${row.original.name}"? This can't be undone.`)) remove.mutate(row.original.id);
                }}
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [remove],
  );

  return (
    <div>
      <PageHeader
        title="Offices"
        description="Headquarters and branch locations your staff work out of."
        actions={
          <Button size="sm" onClick={() => setDialogOpen(true)}>
            <Plus className="h-3.5 w-3.5" />
            New office
          </Button>
        }
      />

      <div className="mb-3">
        <ListToolbar searchValue={search} onSearchChange={setSearch} searchPlaceholder="Search offices…" />
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
        emptyState={
          <EmptyState
            icon={Building}
            title="No offices yet"
            description="Add your headquarters and any branch locations."
            action={
              <Button size="sm" onClick={() => setDialogOpen(true)}>
                <Plus className="h-3.5 w-3.5" /> New office
              </Button>
            }
            className="border-none py-20"
          />
        }
      />

      <OfficeFormDialog office={null} open={dialogOpen} onOpenChange={setDialogOpen} />
      <OfficeFormDialog office={editing} open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(null)} />
    </div>
  );
}
