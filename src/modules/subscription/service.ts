import { apiClient } from "@/services/apiClient";
import type {
  ChangePlanPayload,
  OrganizationRead,
  OrganizationSubscriptionRead,
  OrganizationUpdatePayload,
  PurchaseSeatsPayload,
} from "./types";

export const subscriptionService = {
  async getOrganization(): Promise<OrganizationRead> {
    const { data } = await apiClient.get<OrganizationRead>("/organizations/me");
    return data;
  },

  async updateOrganization(payload: OrganizationUpdatePayload): Promise<OrganizationRead> {
    const { data } = await apiClient.patch<OrganizationRead>("/organizations/me", payload);
    return data;
  },

  async uploadLogo(file: File): Promise<OrganizationRead> {
    const form = new FormData();
    form.append("file", file);
    const { data } = await apiClient.post<OrganizationRead>("/organizations/me/logo", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  async uploadFavicon(file: File): Promise<OrganizationRead> {
    const form = new FormData();
    form.append("file", file);
    const { data } = await apiClient.post<OrganizationRead>("/organizations/me/favicon", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  async getSubscription(): Promise<OrganizationSubscriptionRead> {
    const { data } = await apiClient.get<OrganizationSubscriptionRead>("/organizations/me/subscription");
    return data;
  },

  async purchaseSeats(payload: PurchaseSeatsPayload): Promise<OrganizationSubscriptionRead> {
    const { data } = await apiClient.post<OrganizationSubscriptionRead>("/organizations/me/subscription/seats", payload);
    return data;
  },

  async changePlan(payload: ChangePlanPayload): Promise<OrganizationSubscriptionRead> {
    const { data } = await apiClient.post<OrganizationSubscriptionRead>("/organizations/me/subscription/plan", payload);
    return data;
  },
};
