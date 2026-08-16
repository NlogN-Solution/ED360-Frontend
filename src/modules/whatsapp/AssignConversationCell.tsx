import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { StaffNameCell } from "@/modules/users/StaffNameCell";
import { useUsers } from "@/modules/users/hooks";
import { useDebounce } from "@/hooks/useDebounce";
import { useAssignWhatsAppConversation } from "./hooks";
import { UserRole } from "@/types/enums";
import { cn } from "@/lib/utils";

// Same searchable-staff-popover pattern as modules/leads/AssignedToCell.tsx.
export function AssignConversationCell({ conversationId, assignedTo }: { conversationId: string; assignedTo: string | null }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 250);
  const assign = useAssignWhatsAppConversation();
  const { data, isLoading } = useUsers({ search: debouncedSearch || undefined, role: UserRole.COUNSELLOR, limit: 20 });

  return (
    <Popover
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) setSearch("");
      }}
    >
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-7 gap-1.5 text-xs">
          {assign.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
          <StaffNameCell userId={assignedTo} fallback="Unassigned" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 p-0">
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
              {assignedTo && (
                <CommandItem
                  value="__unassign"
                  onSelect={() => {
                    setOpen(false);
                    assign.mutate({ conversationId, assignedTo: null });
                  }}
                >
                  <span className="flex-1 text-muted-foreground">Unassign</span>
                </CommandItem>
              )}
              {data?.items.map((user) => (
                <CommandItem
                  key={user.id}
                  value={user.id}
                  onSelect={() => {
                    setOpen(false);
                    if (user.id !== assignedTo) assign.mutate({ conversationId, assignedTo: user.id });
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
