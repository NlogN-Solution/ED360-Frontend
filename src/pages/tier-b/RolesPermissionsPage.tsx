import { useMemo } from "react";
import { Loader2, Lock, RotateCcw } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { ALL_NAV_ITEMS } from "@/constants/navigation";
import type { ModuleKey } from "@/constants/permissions";
import { usePermissionMatrix, useResetPermissionMatrix, useUpdatePermissionMatrix } from "@/modules/permissions/hooks";
import { UserRole } from "@/types/enums";
import { toTitleCase } from "@/utils/format";

const ROLE_ORDER: UserRole[] = [
  UserRole.SUPER_ADMIN,
  UserRole.ADMIN,
  UserRole.MANAGER,
  UserRole.COUNSELLOR,
  UserRole.FINANCE,
  UserRole.MARKETING,
  UserRole.SUPPORT,
  UserRole.ADMISSIONS,
  UserRole.STAFF,
  UserRole.FRONTDESK,
  UserRole.STUDENT,
];

const MODULE_META = new Map(ALL_NAV_ITEMS.map((item) => [item.module, item]));

export function RolesPermissionsPage() {
  const { data, isLoading } = usePermissionMatrix();
  const update = useUpdatePermissionMatrix();
  const reset = useResetPermissionMatrix();

  const modules = useMemo(() => {
    if (!data) return [];
    const seen = new Set<ModuleKey>();
    const ordered: ModuleKey[] = [];
    for (const cell of data.items) {
      if (!seen.has(cell.module)) {
        seen.add(cell.module);
        ordered.push(cell.module);
      }
    }
    return ordered;
  }, [data]);

  const cellMap = useMemo(() => {
    const map = new Map<string, { can_read: boolean; can_write: boolean }>();
    for (const cell of data?.items ?? []) {
      map.set(`${cell.role}:${cell.module}`, { can_read: cell.can_read, can_write: cell.can_write });
    }
    return map;
  }, [data]);

  function toggle(role: UserRole, module: ModuleKey, field: "can_read" | "can_write", value: boolean) {
    const current = cellMap.get(`${role}:${module}`) ?? { can_read: false, can_write: false };
    const next = { ...current, [field]: value };
    // Write implies read — a role that can mutate a module can always view it.
    if (field === "can_write" && value) next.can_read = true;
    if (field === "can_read" && !value) next.can_write = false;
    update.mutate([{ role, module, can_read: next.can_read, can_write: next.can_write }]);
  }

  if (isLoading || !data) {
    return (
      <div>
        <PageHeader title="Roles & Permissions" description="Loading the permission matrix…" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Roles & Permissions"
        description="Configure read/write access per role and module. Leads is fully enforced by the API; other modules persist here but aren't wired into their routes yet."
        actions={
          <Button variant="outline" size="sm" disabled={reset.isPending} onClick={() => reset.mutate()}>
            {reset.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />}
            Reset to defaults
          </Button>
        }
      />

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full min-w-[1100px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="sticky left-0 bg-card px-4 py-2.5 text-left text-[12px] font-medium text-muted-foreground">Module</th>
              {ROLE_ORDER.map((role) => (
                <th key={role} className="px-3 py-2.5 text-center text-[12px] font-medium text-muted-foreground">
                  {toTitleCase(role)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {modules.map((module) => {
              const meta = MODULE_META.get(module);
              return (
                <tr key={module} className="border-b border-border last:border-none">
                  <td className="sticky left-0 flex items-center gap-2 bg-card px-4 py-2 text-[13px] text-foreground">
                    {meta && <meta.icon className="h-3.5 w-3.5 text-muted-foreground" />}
                    {meta?.label ?? module}
                  </td>
                  {ROLE_ORDER.map((role) => {
                    const isSuperAdmin = role === UserRole.SUPER_ADMIN;
                    const cell = isSuperAdmin
                      ? { can_read: true, can_write: true }
                      : (cellMap.get(`${role}:${module}`) ?? { can_read: false, can_write: false });
                    return (
                      <td key={role} className="px-3 py-2">
                        <div className="flex items-center justify-center gap-2.5">
                          <label className="flex items-center gap-1 text-[10px] text-muted-foreground" title="Read">
                            <Checkbox
                              checked={cell.can_read}
                              disabled={isSuperAdmin || update.isPending}
                              onCheckedChange={(v) => toggle(role, module, "can_read", v === true)}
                            />
                            R
                          </label>
                          <label className="flex items-center gap-1 text-[10px] text-muted-foreground" title="Write">
                            <Checkbox
                              checked={cell.can_write}
                              disabled={isSuperAdmin || update.isPending}
                              onCheckedChange={(v) => toggle(role, module, "can_write", v === true)}
                            />
                            W
                          </label>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-start gap-2 rounded-xl border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
        <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <p>
          <strong className="font-medium text-foreground">Leads</strong> is the one module where these checkboxes are a real
          backend gate — every Leads route checks this matrix on every request. Every other module's cells are saved here for
          configuration purposes but its routes still use their original fixed role checks, so changing them here has no
          effect yet. <strong className="font-medium text-foreground">Super Admin bypasses this matrix entirely</strong> and
          always has full access, regardless of what's checked above.
        </p>
      </div>
    </div>
  );
}
