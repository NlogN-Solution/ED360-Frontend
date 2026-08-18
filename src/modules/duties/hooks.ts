import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/constants/queryKeys";
import { getErrorMessage } from "@/utils/errors";
import { dutyService } from "./service";
import type { DutyCreatePayload, DutyListParams, DutyUpdatePayload } from "./types";

export function useDuties(params: DutyListParams) {
  return useQuery({
    queryKey: queryKeys.duties.list(params),
    queryFn: () => dutyService.list(params),
    placeholderData: (prev) => prev,
  });
}

export function useMyDuties() {
  return useQuery({
    queryKey: queryKeys.duties.mine,
    queryFn: () => dutyService.listMine(),
  });
}

export function useMyPendingDuties() {
  return useQuery({
    queryKey: queryKeys.duties.minePending,
    queryFn: () => dutyService.listMinePending(),
  });
}

export function useDuty(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.duties.detail(id ?? ""),
    queryFn: () => dutyService.get(id as string),
    enabled: Boolean(id),
  });
}

function useInvalidateDuties() {
  const queryClient = useQueryClient();
  return (id?: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.duties.all });
    if (id) {
      queryClient.invalidateQueries({ queryKey: queryKeys.duties.versions(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.duties.acknowledgements(id) });
    }
  };
}

export function useCreateDuty() {
  const invalidate = useInvalidateDuties();
  return useMutation({
    mutationFn: (payload: DutyCreatePayload) => dutyService.create(payload),
    onSuccess: () => {
      invalidate();
      toast.success("Duty created");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Couldn't create duty")),
  });
}

export function useUpdateDuty(id: string) {
  const invalidate = useInvalidateDuties();
  return useMutation({
    mutationFn: (payload: DutyUpdatePayload) => dutyService.update(id, payload),
    onSuccess: () => {
      invalidate(id);
      toast.success("Duty updated");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Couldn't update duty")),
  });
}

export function useDeleteDuty() {
  const invalidate = useInvalidateDuties();
  return useMutation({
    mutationFn: (id: string) => dutyService.remove(id),
    onSuccess: () => {
      invalidate();
      toast.success("Duty deleted");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Couldn't delete duty")),
  });
}

export function usePublishDuty() {
  const invalidate = useInvalidateDuties();
  return useMutation({
    mutationFn: (id: string) => dutyService.publish(id),
    onSuccess: (_, id) => {
      invalidate(id);
      toast.success("Published");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Couldn't publish")),
  });
}

export function useArchiveDuty() {
  const invalidate = useInvalidateDuties();
  return useMutation({
    mutationFn: (id: string) => dutyService.archive(id),
    onSuccess: (_, id) => {
      invalidate(id);
      toast.success("Archived");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Couldn't archive")),
  });
}

export function useDutyVersions(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.duties.versions(id ?? ""),
    queryFn: () => dutyService.listVersions(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateDutyVersion(id: string) {
  const invalidate = useInvalidateDuties();
  return useMutation({
    mutationFn: ({ title, content }: { title: string | null; content: string | null }) => dutyService.createVersion(id, title, content),
    onSuccess: () => {
      invalidate(id);
      toast.success("Draft version created");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Couldn't create version")),
  });
}

export function usePublishDutyVersion(id: string) {
  const invalidate = useInvalidateDuties();
  return useMutation({
    mutationFn: (version: number) => dutyService.publishVersion(id, version),
    onSuccess: () => {
      invalidate(id);
      toast.success("Version published");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Couldn't publish version")),
  });
}

export function useAcknowledgeDuty(id: string) {
  const invalidate = useInvalidateDuties();
  return useMutation({
    mutationFn: () => dutyService.acknowledge(id),
    onSuccess: () => {
      invalidate(id);
      toast.success("Acknowledged");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Couldn't acknowledge")),
  });
}

export function useDutyAcknowledgements(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.duties.acknowledgements(id ?? ""),
    queryFn: () => dutyService.getAcknowledgements(id as string),
    enabled: Boolean(id),
  });
}
