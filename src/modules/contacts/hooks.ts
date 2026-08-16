import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/constants/queryKeys";
import { getErrorMessage } from "@/utils/errors";
import { contactService } from "./service";
import type { ContactCreatePayload, ContactListParams, ContactUpdatePayload } from "./types";

export function useContacts(params: ContactListParams) {
  return useQuery({
    queryKey: queryKeys.contacts.list(params),
    queryFn: () => contactService.list(params),
    placeholderData: (prev) => prev,
  });
}

function useInvalidateContacts() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: queryKeys.contacts.all });
}

export function useCreateContact() {
  const invalidate = useInvalidateContacts();
  return useMutation({
    mutationFn: (payload: ContactCreatePayload) => contactService.create(payload),
    onSuccess: () => {
      invalidate();
      toast.success("Contact created");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Couldn't create contact")),
  });
}

export function useUpdateContact(id: string) {
  const invalidate = useInvalidateContacts();
  return useMutation({
    mutationFn: (payload: ContactUpdatePayload) => contactService.update(id, payload),
    onSuccess: () => {
      invalidate();
      toast.success("Contact updated");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Couldn't update contact")),
  });
}

export function useDeleteContact() {
  const invalidate = useInvalidateContacts();
  return useMutation({
    mutationFn: (id: string) => contactService.remove(id),
    onSuccess: () => {
      invalidate();
      toast.success("Contact deleted");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Couldn't delete contact")),
  });
}
