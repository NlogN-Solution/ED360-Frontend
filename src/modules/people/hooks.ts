import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/constants/queryKeys";
import { getErrorMessage } from "@/utils/errors";
import { departmentService, employeeDirectoryService, officeService } from "./service";
import type {
  DepartmentCreatePayload,
  DepartmentListParams,
  DepartmentUpdatePayload,
  EmployeeDirectoryParams,
  OfficeCreatePayload,
  OfficeListParams,
  OfficeUpdatePayload,
} from "./types";

export function useDepartments(params: DepartmentListParams) {
  return useQuery({
    queryKey: queryKeys.departments.list(params),
    queryFn: () => departmentService.list(params),
    placeholderData: (prev) => prev,
  });
}

export function useDepartment(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.departments.detail(id ?? ""),
    queryFn: () => departmentService.get(id as string),
    enabled: Boolean(id),
  });
}

function useInvalidateDepartments() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.departments.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.employeeDirectory.all });
  };
}

export function useCreateDepartment() {
  const invalidate = useInvalidateDepartments();
  return useMutation({
    mutationFn: (payload: DepartmentCreatePayload) => departmentService.create(payload),
    onSuccess: () => {
      invalidate();
      toast.success("Department created");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Couldn't create department")),
  });
}

export function useUpdateDepartment(id: string) {
  const invalidate = useInvalidateDepartments();
  return useMutation({
    mutationFn: (payload: DepartmentUpdatePayload) => departmentService.update(id, payload),
    onSuccess: () => {
      invalidate();
      toast.success("Department updated");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Couldn't update department")),
  });
}

export function useDeleteDepartment() {
  const invalidate = useInvalidateDepartments();
  return useMutation({
    mutationFn: (id: string) => departmentService.remove(id),
    onSuccess: () => {
      invalidate();
      toast.success("Department deleted");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Couldn't delete department")),
  });
}

export function useOffices(params: OfficeListParams) {
  return useQuery({
    queryKey: queryKeys.offices.list(params),
    queryFn: () => officeService.list(params),
    placeholderData: (prev) => prev,
  });
}

export function useOffice(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.offices.detail(id ?? ""),
    queryFn: () => officeService.get(id as string),
    enabled: Boolean(id),
  });
}

function useInvalidateOffices() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.offices.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.employeeDirectory.all });
  };
}

export function useCreateOffice() {
  const invalidate = useInvalidateOffices();
  return useMutation({
    mutationFn: (payload: OfficeCreatePayload) => officeService.create(payload),
    onSuccess: () => {
      invalidate();
      toast.success("Office created");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Couldn't create office")),
  });
}

export function useUpdateOffice(id: string) {
  const invalidate = useInvalidateOffices();
  return useMutation({
    mutationFn: (payload: OfficeUpdatePayload) => officeService.update(id, payload),
    onSuccess: () => {
      invalidate();
      toast.success("Office updated");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Couldn't update office")),
  });
}

export function useDeleteOffice() {
  const invalidate = useInvalidateOffices();
  return useMutation({
    mutationFn: (id: string) => officeService.remove(id),
    onSuccess: () => {
      invalidate();
      toast.success("Office deleted");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Couldn't delete office")),
  });
}

export function useEmployeeDirectory(params: EmployeeDirectoryParams) {
  return useQuery({
    queryKey: queryKeys.employeeDirectory.list(params),
    queryFn: () => employeeDirectoryService.list(params),
    placeholderData: (prev) => prev,
  });
}
