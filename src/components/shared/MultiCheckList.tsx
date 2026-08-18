import { Checkbox } from "@/components/ui/checkbox";

export function MultiCheckList({
  options,
  value,
  onChange,
  emptyMessage = "None available.",
}: {
  options: { id: string; label: string }[];
  value: string[];
  onChange: (ids: string[]) => void;
  emptyMessage?: string;
}) {
  function toggle(id: string) {
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);
  }

  if (options.length === 0) {
    return <p className="rounded-lg border border-dashed border-border p-3 text-sm text-muted-foreground">{emptyMessage}</p>;
  }

  return (
    <div className="max-h-40 space-y-1.5 overflow-y-auto rounded-lg border border-border p-3">
      {options.map((option) => (
        <label key={option.id} className="flex items-center gap-2 text-sm">
          <Checkbox checked={value.includes(option.id)} onCheckedChange={() => toggle(option.id)} />
          {option.label}
        </label>
      ))}
    </div>
  );
}
