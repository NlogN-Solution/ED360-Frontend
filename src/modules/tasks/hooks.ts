import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/constants/queryKeys";
import type { ListResponse } from "@/types/api";
import { getErrorMessage } from "@/utils/errors";
import { taskService } from "./service";
import type { TaskCreatePayload, TaskListParams, TaskRead, TaskUpdatePayload } from "./types";

export function useTasks(params: TaskListParams) {
  return useQuery({
    queryKey: queryKeys.tasks.list(params),
    queryFn: () => taskService.list(params),
    placeholderData: (prev) => prev,
  });
}

function useInvalidateTasks() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
}

export function useCreateTask() {
  const invalidate = useInvalidateTasks();
  return useMutation({
    mutationFn: (payload: TaskCreatePayload) => taskService.create(payload),
    onSuccess: () => {
      invalidate();
      toast.success("Task created");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Couldn't create task")),
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateTasks();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: TaskUpdatePayload }) => taskService.update(id, payload),
    onMutate: async ({ id, payload }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.tasks.all });
      const previous = queryClient.getQueriesData<ListResponse<TaskRead>>({ queryKey: queryKeys.tasks.all });
      queryClient.setQueriesData<ListResponse<TaskRead>>({ queryKey: queryKeys.tasks.all }, (old) =>
        old ? { ...old, items: old.items.map((t) => (t.id === id ? { ...t, ...payload } : t)) } : old,
      );
      return { previous };
    },
    onError: (error, _vars, context) => {
      context?.previous.forEach(([key, data]) => queryClient.setQueryData(key, data));
      toast.error(getErrorMessage(error, "Couldn't update task"));
    },
    onSettled: () => invalidate(),
  });
}

export function useDeleteTask() {
  const invalidate = useInvalidateTasks();
  return useMutation({
    mutationFn: (id: string) => taskService.remove(id),
    onSuccess: () => {
      invalidate();
      toast.success("Task deleted");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Couldn't delete task")),
  });
}
