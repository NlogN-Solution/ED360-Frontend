import { apiClient } from "@/services/apiClient";
import type { ListResponse } from "@/types/api";
import type { Contact, ContactCreatePayload, ContactListParams, ContactUpdatePayload } from "./types";

export const contactService = {
  async list(params: ContactListParams): Promise<ListResponse<Contact>> {
    const { data } = await apiClient.get<ListResponse<Contact>>("/contacts", { params });
    return data;
  },
  async get(id: string): Promise<Contact> {
    const { data } = await apiClient.get<Contact>(`/contacts/${id}`);
    return data;
  },
  async create(payload: ContactCreatePayload): Promise<Contact> {
    const { data } = await apiClient.post<Contact>("/contacts", payload);
    return data;
  },
  async update(id: string, payload: ContactUpdatePayload): Promise<Contact> {
    const { data } = await apiClient.patch<Contact>(`/contacts/${id}`, payload);
    return data;
  },
  async remove(id: string): Promise<Contact> {
    const { data } = await apiClient.delete<Contact>(`/contacts/${id}`);
    return data;
  },
};
