import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/constants/queryKeys";
import { getErrorMessage } from "@/utils/errors";
import { platformService } from "./service";
import type {
  PlatformChangePlanPayload,
  PlatformOrganizationListParams,
  UpdateOrganizationStatusPayload,
} from "./types";

export function usePlatformOrganizations(params: PlatformOrganizationListParams) {
  return useQuery({
    queryKey: queryKeys.platform.organizations(params),
    queryFn: () => platformService.listOrganizations(params),
    placeholderData: (prev) => prev,
  });
}

export function usePlatformOrganization(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.platform.organization(id ?? ""),
    queryFn: () => platformService.getOrganization(id as string),
    enabled: Boolean(id),
  });
}

export function useUpdateOrganizationStatus(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateOrganizationStatusPayload) => platformService.updateStatus(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.platform.organization(id) });
      queryClient.invalidateQueries({ queryKey: ["platform", "organizations"] });
      toast.success("Organization status updated");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Couldn't update organization status")),
  });
}

export function useOverridePlan(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PlatformChangePlanPayload) => platformService.overridePlan(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.platform.organization(id) });
      toast.success("Plan updated");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Couldn't override plan")),
  });
}

export function useDeleteOrganization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => platformService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["platform", "organizations"] });
      toast.success("Organization deleted");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Couldn't delete organization")),
  });
}
