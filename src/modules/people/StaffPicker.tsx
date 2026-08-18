import { useState } from "react";
import { Check, ChevronsUpDown, Loader2, User as UserIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { useStaffDirectory } from "@/modules/users/hooks";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";

/** Single-select staff picker (e.g. choosing a manager or department head) —
 * backed by the minimal /users/staff-directory endpoint rather than the
 * admin/counsellor-gated GET /users, so it stays usable anywhere a manager
 * needs to pick a colleague. */
export function StaffPicker({
  value,
  onChange,
  placeholder = "Select person…",
  disabled,
}: {
  value?: string | null;
  onChange: (userId: string | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 250);

  const { data, isLoading } = useStaffDirectory({ search: debouncedSearch || undefined, limit: 20 });
  const selected = data?.find((u) => u.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" disabled={disabled} className="w-full justify-between font-normal">
          <span className="flex min-w-0 items-center gap-2">
            <UserIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <span className="truncate">{selected ? `${selected.first_name} ${selected.last_name}` : placeholder}</span>
          </span>
          <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput placeholder="Search staff…" value={search} onValueChange={setSearch} />
          <CommandList>
            {isLoading && (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            )}
            <CommandEmpty>No one found.</CommandEmpty>
            <CommandGroup>
              {(data ?? []).map((user) => (
                <CommandItem
                  key={user.id}
                  value={user.id}
                  onSelect={() => {
                    onChange(user.id === value ? undefined : user.id);
                    setOpen(false);
                  }}
                >
                  <Check className={cn("h-3.5 w-3.5", value === user.id ? "opacity-100" : "opacity-0")} />
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

/** Multi-select variant of StaffPicker — e.g. assigning several owners to a duty. */
export function MultiStaffPicker({
  value,
  onChange,
  placeholder = "Select people…",
  disabled,
}: {
  value: string[];
  onChange: (userIds: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 250);

  const { data, isLoading } = useStaffDirectory({ search: debouncedSearch || undefined, limit: 20 });
  const selected = (data ?? []).filter((u) => value.includes(u.id));

  function toggle(userId: string) {
    onChange(value.includes(userId) ? value.filter((id) => id !== userId) : [...value, userId]);
  }

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" disabled={disabled} className="w-full justify-between font-normal">
            <span className="flex min-w-0 items-center gap-2">
              <UserIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <span className="truncate">{value.length > 0 ? `${value.length} selected` : placeholder}</span>
            </span>
            <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput placeholder="Search staff…" value={search} onValueChange={setSearch} />
            <CommandList>
              {isLoading && (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              )}
              <CommandEmpty>No one found.</CommandEmpty>
              <CommandGroup>
                {(data ?? []).map((user) => (
                  <CommandItem key={user.id} value={user.id} onSelect={() => toggle(user.id)}>
                    <Check className={cn("h-3.5 w-3.5", value.includes(user.id) ? "opacity-100" : "opacity-0")} />
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
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((user) => (
            <span
              key={user.id}
              className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-foreground"
            >
              {user.first_name} {user.last_name}
              {!disabled && (
                <button type="button" onClick={() => toggle(user.id)} className="text-muted-foreground hover:text-danger">
                  <X className="h-3 w-3" />
                </button>
              )}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
