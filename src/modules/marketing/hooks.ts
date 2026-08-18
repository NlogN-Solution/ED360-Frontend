import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/constants/queryKeys";
import { getErrorMessage } from "@/utils/errors";
import { audienceSegmentService } from "./service";
import type { AudienceSegmentCreatePayload, AudienceSegmentUpdatePayload, SegmentFilters } from "./types";

export function useAudienceSegments() {
  return useQuery({
    queryKey: queryKeys.audienceSegments.all,
    queryFn: () => audienceSegmentService.list(),
  });
}

export function useAudienceSegment(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.audienceSegments.detail(id ?? ""),
    queryFn: () => audienceSegmentService.get(id as string),
    enabled: Boolean(id),
  });
}

function useInvalidateSegments() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: queryKeys.audienceSegments.all });
}

export function useCreateAudienceSegment() {
  const invalidate = useInvalidateSegments();
  return useMutation({
    mutationFn: (payload: AudienceSegmentCreatePayload) => audienceSegmentService.create(payload),
    onSuccess: () => {
      invalidate();
      toast.success("Segment saved");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Couldn't save segment")),
  });
}

export function useUpdateAudienceSegment(id: string) {
  const invalidate = useInvalidateSegments();
  return useMutation({
    mutationFn: (payload: AudienceSegmentUpdatePayload) => audienceSegmentService.update(id, payload),
    onSuccess: () => {
      invalidate();
      toast.success("Segment updated");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Couldn't update segment")),
  });
}

export function useDeleteAudienceSegment() {
  const invalidate = useInvalidateSegments();
  return useMutation({
    mutationFn: (id: string) => audienceSegmentService.remove(id),
    onSuccess: () => {
      invalidate();
      toast.success("Segment deleted");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Couldn't delete segment")),
  });
}

/** Ad hoc preview while building/editing filters, before they're saved. */
export function usePreviewFilters() {
  return useMutation({
    mutationFn: (filters: SegmentFilters) => audienceSegmentService.previewFilters(filters),
    onError: (error) => toast.error(getErrorMessage(error, "Couldn't preview segment")),
  });
}

export function useSegmentPreview(id: string | undefined, page: number) {
  return useQuery({
    queryKey: queryKeys.audienceSegments.preview(id ?? "", page),
    queryFn: () => audienceSegmentService.previewSaved(id as string, page),
    enabled: Boolean(id),
  });
}
