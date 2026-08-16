import { useEffect, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Contact2, Loader2, Mail, MoreHorizontal, Phone, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { ListToolbar } from "@/components/shared/ListToolbar";
import { DataTable } from "@/components/shared/DataTable";
import { EmptyState } from "@/components/shared/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDebounce } from "@/hooks/useDebounce";
import { useQueryFlagDialog } from "@/hooks/useQueryFlagDialog";
import { useAuthStore } from "@/services/authStore";
import { isManagerRole } from "@/constants/permissions";
import { useContacts, useCreateContact, useDeleteContact, useUpdateContact } from "@/modules/contacts/hooks";
import type { Contact } from "@/modules/contacts/types";
import { ContactType } from "@/types/enums";
import { toTitleCase } from "@/utils/format";

function ContactFormDialog({ contact, open, onOpenChange }: { contact: Contact | null; open: boolean; onOpenChange: (open: boolean) => void }) {
  const isEdit = Boolean(contact);
  const create = useCreateContact();
  const update = useUpdateContact(contact?.id ?? "");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [contactType, setContactType] = useState<string>(ContactType.OTHER);
  const [notes, setNotes] = useState("");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (open) {
      setName(contact?.name ?? "");
      setEmail(contact?.email ?? "");
      setPhone(contact?.phone ?? "");
      setCompany(contact?.company ?? "");
      setContactType(contact?.contact_type ?? ContactType.OTHER);
      setNotes(contact?.notes ?? "");
      setIsActive(contact?.is_active ?? true);
    }
  }, [open, contact]);

  const isPending = create.isPending || update.isPending;

  function handleSubmit() {
    if (!name.trim()) return;
    const payload = {
      name: name.trim(),
      email: email || undefined,
      phone: phone || undefined,
      company: company || undefined,
      contact_type: contactType as ContactType,
      notes: notes || undefined,
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit contact" : "New contact"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Smith" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select value={contactType} onValueChange={setContactType}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(ContactType).map((t) => (
                    <SelectItem key={t} value={t}>
                      {toTitleCase(t)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Company (optional)</Label>
              <Input value={company} onChange={(e) => setCompany(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Email (optional)</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Phone (optional)</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Notes (optional)</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
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

export function ContactsPage() {
  const role = useAuthStore((s) => s.user?.role);
  const canManage = isManagerRole(role);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);
  const [contactType, setContactType] = useState("all");
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useQueryFlagDialog();
  const [editing, setEditing] = useState<Contact | null>(null);
  const remove = useDeleteContact();

  const params = useMemo(
    () => ({
      page,
      limit: 20,
      search: debouncedSearch || undefined,
      contact_type: contactType === "all" ? undefined : (contactType as ContactType),
    }),
    [page, debouncedSearch, contactType],
  );
  const { data, isLoading } = useContacts(params);

  const columns = useMemo<ColumnDef<Contact, any>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
          <div>
            <p className="line-clamp-1 font-medium text-foreground">{row.original.name}</p>
            {row.original.company && <p className="line-clamp-1 text-xs text-muted-foreground">{row.original.company}</p>}
          </div>
        ),
      },
      {
        accessorKey: "contact_type",
        header: "Type",
        cell: ({ getValue }) => <Badge variant="secondary">{toTitleCase(getValue<string>())}</Badge>,
      },
      {
        id: "contact_info",
        header: "Contact",
        cell: ({ row }) => (
          <div className="space-y-0.5 text-xs text-muted-foreground">
            {row.original.email && (
              <p className="flex items-center gap-1.5">
                <Mail className="h-3 w-3 shrink-0" /> {row.original.email}
              </p>
            )}
            {row.original.phone && (
              <p className="flex items-center gap-1.5">
                <Phone className="h-3 w-3 shrink-0" /> {row.original.phone}
              </p>
            )}
            {!row.original.email && !row.original.phone && "—"}
          </div>
        ),
      },
      {
        accessorKey: "is_active",
        header: "Status",
        cell: ({ getValue }) => (getValue<boolean>() ? <Badge>Active</Badge> : <Badge variant="outline">Inactive</Badge>),
      },
      ...(canManage
        ? [
            {
              id: "actions",
              header: "",
              size: 48,
              cell: ({ row }: { row: { original: Contact } }) => (
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
          ]
        : []),
    ],
    [remove, canManage],
  );

  return (
    <div>
      <PageHeader
        title="Contacts"
        description="A shared address book of partners, agents, and other external contacts."
        actions={
          canManage ? (
            <Button size="sm" onClick={() => setDialogOpen(true)}>
              <Plus className="h-3.5 w-3.5" />
              New contact
            </Button>
          ) : undefined
        }
      />

      <div className="mb-3">
        <ListToolbar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search contacts…"
          filters={
            <Select value={contactType} onValueChange={setContactType}>
              <SelectTrigger size="sm" className="h-8 w-[150px] text-xs">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                {Object.values(ContactType).map((t) => (
                  <SelectItem key={t} value={t}>
                    {toTitleCase(t)}
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
        page={page}
        limit={20}
        total={data?.total}
        onPageChange={setPage}
        emptyState={
          <EmptyState
            icon={Contact2}
            title="No contacts yet"
            description="Add partners, agents, and other external contacts your team works with."
            action={
              canManage ? (
                <Button size="sm" onClick={() => setDialogOpen(true)}>
                  <Plus className="h-3.5 w-3.5" /> New contact
                </Button>
              ) : undefined
            }
            className="border-none py-20"
          />
        }
      />

      {canManage && (
        <>
          <ContactFormDialog contact={null} open={dialogOpen} onOpenChange={setDialogOpen} />
          <ContactFormDialog contact={editing} open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(null)} />
        </>
      )}
    </div>
  );
}
