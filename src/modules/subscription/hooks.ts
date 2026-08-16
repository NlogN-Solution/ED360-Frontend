import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/constants/queryKeys";
import { getErrorMessage } from "@/utils/errors";
import { subscriptionService } from "./service";
import type { ChangePlanPayload, OrganizationUpdatePayload, PurchaseSeatsPayload } from "./types";

export function useOrganization() {
  return useQuery({
    queryKey: queryKeys.organization.me,
    queryFn: () => subscriptionService.getOrganization(),
  });
}

function useInvalidateOrganization() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: queryKeys.organization.me });
}

export function useUpdateOrganization() {
  const invalidate = useInvalidateOrganization();
  return useMutation({
    mutationFn: (payload: OrganizationUpdatePayload) => subscriptionService.updateOrganization(payload),
    onSuccess: () => {
      invalidate();
      toast.success("Platform settings updated");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Couldn't update platform settings")),
  });
}

export function useUploadOrgLogo() {
  const invalidate = useInvalidateOrganization();
  return useMutation({
    mutationFn: (file: File) => subscriptionService.uploadLogo(file),
    onSuccess: () => {
      invalidate();
      toast.success("Logo updated");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Couldn't upload logo")),
  });
}

export function useUploadOrgFavicon() {
  const invalidate = useInvalidateOrganization();
  return useMutation({
    mutationFn: (file: File) => subscriptionService.uploadFavicon(file),
    onSuccess: () => {
      invalidate();
      toast.success("Favicon updated");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Couldn't upload favicon")),
  });
}

export function useOrganizationSubscription() {
  return useQuery({
    queryKey: queryKeys.organization.subscription,
    queryFn: () => subscriptionService.getSubscription(),
  });
}

export function usePurchaseSeats() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PurchaseSeatsPayload) => subscriptionService.purchaseSeats(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.organization.subscription });
      toast.success("Seats purchased");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Couldn't purchase seats")),
  });
}

export function useChangePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ChangePlanPayload) => subscriptionService.changePlan(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.organization.subscription });
      toast.success("Plan updated");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Couldn't change plan")),
  });
}
