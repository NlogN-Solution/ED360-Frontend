import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { StaffNameCell } from "@/modules/users/StaffNameCell";
import { useUsers } from "@/modules/users/hooks";
import { useDebounce } from "@/hooks/useDebounce";
import { useInlineAssign } from "./hooks";
import { UserRole } from "@/types/enums";
import { cn } from "@/lib/utils";

export function AssignedToCell({ leadId, assignedTo, editable }: { leadId: string; assignedTo: string | null; editable: boolean }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 250);
  const assign = useInlineAssign(leadId);
  const { data, isLoading } = useUsers({ search: debouncedSearch || undefined, role: UserRole.COUNSELLOR, limit: 20 });

  if (!editable) return <StaffNameCell userId={assignedTo} />;

  return (
    <Popover
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) setSearch("");
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          className="flex w-full items-center gap-1.5 rounded-md px-1.5 py-0.5 -mx-1.5 text-left outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50"
          aria-label={assignedTo ? "Reassign lead" : "Assign lead"}
        >
          <StaffNameCell userId={assignedTo} />
          {assign.isPending && <Loader2 className="h-3 w-3 shrink-0 animate-spin text-muted-foreground" aria-hidden="true" />}
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-0" onClick={(e) => e.stopPropagation()}>
        <Command shouldFilter={false}>
          <CommandInput placeholder="Assign to counsellor…" value={search} onValueChange={setSearch} />
          <CommandList>
            {isLoading && (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" aria-hidden="true" />
              </div>
            )}
            <CommandEmpty>No counsellors found.</CommandEmpty>
            <CommandGroup>
              {data?.items.map((user) => (
                <CommandItem
                  key={user.id}
                  value={user.id}
                  onSelect={() => {
                    setOpen(false);
                    if (user.id !== assignedTo) assign.mutate(user.id);
                  }}
                >
                  <Check className={cn("h-3.5 w-3.5", assignedTo === user.id ? "opacity-100" : "opacity-0")} aria-hidden="true" />
                  <span className="flex-1 truncate">
                    {user.first_name} {user.last_name}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
