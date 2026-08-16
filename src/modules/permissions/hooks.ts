import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/constants/queryKeys";
import { getErrorMessage } from "@/utils/errors";
import { permissionService } from "./service";
import type { PermissionUpdate } from "./types";

export function usePermissionMatrix() {
  return useQuery({
    queryKey: queryKeys.permissions.all,
    queryFn: () => permissionService.getMatrix(),
  });
}

export function useUpdatePermissionMatrix() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (items: PermissionUpdate[]) => permissionService.updateMatrix(items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.permissions.all });
    },
    onError: (error) => toast.error(getErrorMessage(error, "Couldn't update permission")),
  });
}

export function useResetPermissionMatrix() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => permissionService.resetToDefaults(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.permissions.all });
      toast.success("Reset to defaults");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Couldn't reset permissions")),
  });
}
