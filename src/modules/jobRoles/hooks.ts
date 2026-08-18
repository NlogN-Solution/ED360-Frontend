import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/utils/errors";
import { jobRoleService } from "./service";
import type { JobRoleCreatePayload, JobRoleUpdatePayload } from "./types";

const JOB_ROLES_KEY = ["job-roles"] as const;

export function useJobRoles() {
  return useQuery({
    queryKey: JOB_ROLES_KEY,
    queryFn: () => jobRoleService.list(),
  });
}

function useInvalidateJobRoles() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: JOB_ROLES_KEY });
}

export function useCreateJobRole() {
  const invalidate = useInvalidateJobRoles();
  return useMutation({
    mutationFn: (payload: JobRoleCreatePayload) => jobRoleService.create(payload),
    onSuccess: () => {
      invalidate();
      toast.success("Job role created");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Couldn't create job role")),
  });
}

export function useUpdateJobRole() {
  const invalidate = useInvalidateJobRoles();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: JobRoleUpdatePayload }) => jobRoleService.update(id, payload),
    onSuccess: () => {
      invalidate();
      toast.success("Job role updated");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Couldn't update job role")),
  });
}

export function useDeleteJobRole() {
  const invalidate = useInvalidateJobRoles();
  return useMutation({
    mutationFn: (id: string) => jobRoleService.remove(id),
    onSuccess: () => {
      invalidate();
      toast.success("Job role deleted");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Couldn't delete job role")),
  });
}
