import { useMutation, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/constants/queryKeys";
import { getErrorMessage } from "@/utils/errors";
import { toTitleCase } from "@/utils/format";
import type { ListResponse } from "@/types/api";
import type { LeadPriority } from "@/types/enums";
import { FollowUpMethod } from "@/types/enums";
import { leadService } from "./service";
import { NEXT_FOLLOW_UP_GAP_DAYS } from "./types";
import type {
  LeadConvertPayload,
  LeadCreatePayload,
  LeadFollowUpCompletePayload,
  LeadFollowUpCreatePayload,
  LeadListParams,
  LeadMarkLostPayload,
  LeadRead,
  LeadUpdatePayload,
} from "./types";

export function useLeads(params: LeadListParams) {
  return useQuery({
    queryKey: queryKeys.leads.list(params),
    queryFn: () => leadService.list(params),
    placeholderData: (prev) => prev,
  });
}

export function useLead(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.leads.detail(id ?? ""),
    queryFn: () => leadService.get(id as string),
    enabled: Boolean(id),
  });
}

export function useLeadActivities(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.leads.activities(id ?? ""),
    queryFn: () => leadService.activities(id as string),
    enabled: Boolean(id),
  });
}

function useInvalidateLeads() {
  const queryClient = useQueryClient();
  return (id?: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.leads.all });
    if (id) queryClient.invalidateQueries({ queryKey: queryKeys.leads.activities(id) });
  };
}

export function useCreateLead() {
  const invalidate = useInvalidateLeads();
  return useMutation({
    mutationFn: (payload: LeadCreatePayload) => leadService.create(payload),
    onSuccess: () => {
      invalidate();
      toast.success("Lead created");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Couldn't create lead")),
  });
}

export function useUpdateLead(id: string) {
  const invalidate = useInvalidateLeads();
  return useMutation({
    mutationFn: (payload: LeadUpdatePayload) => leadService.update(id, payload),
    onSuccess: () => {
      invalidate(id);
      toast.success("Lead updated");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Couldn't update lead")),
  });
}

export function useAssignLead(id: string) {
  const invalidate = useInvalidateLeads();
  return useMutation({
    mutationFn: (assignedTo: string) => leadService.assign(id, assignedTo),
    onSuccess: () => {
      invalidate(id);
      toast.success("Lead assigned");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Couldn't assign lead")),
  });
}

export function useChangeLeadStatus(id: string) {
  const invalidate = useInvalidateLeads();
  return useMutation({
    mutationFn: ({ status, remarks }: { status: string; remarks?: string }) => leadService.changeStatus(id, status, remarks),
    onSuccess: () => {
      invalidate(id);
      toast.success("Status updated");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Couldn't update status")),
  });
}

export function useQualifyLead(id: string) {
  const invalidate = useInvalidateLeads();
  return useMutation({
    mutationFn: (remarks?: string) => leadService.qualify(id, remarks),
    onSuccess: () => {
      invalidate(id);
      toast.success("Lead qualified — now a prospect");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Couldn't qualify lead")),
  });
}

export function useMarkLeadLost(id: string) {
  const invalidate = useInvalidateLeads();
  return useMutation({
    mutationFn: (payload: LeadMarkLostPayload) => leadService.markLost(id, payload),
    onSuccess: () => {
      invalidate(id);
      toast.success("Lead marked lost");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Couldn't mark lead lost")),
  });
}

export function useConvertLead(id: string) {
  const invalidate = useInvalidateLeads();
  return useMutation({
    mutationFn: (payload: LeadConvertPayload) => leadService.convert(id, payload),
    onSuccess: () => {
      invalidate(id);
      toast.success("Lead converted to client");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Couldn't convert lead")),
  });
}

export function useDeleteLead() {
  const invalidate = useInvalidateLeads();
  return useMutation({
    mutationFn: (id: string) => leadService.remove(id),
    onSuccess: () => {
      invalidate();
      toast.success("Lead deleted");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Couldn't delete lead")),
  });
}

// --- Inline (list) editing -------------------------------------------------
// Toast-free-on-success, optimistic patches for the fast in-row editing model: the
// row updates instantly, a failure rolls the cache back and surfaces a toast, and a
// success surfaces a light "Undo" toast instead of a blocking confirmation — the
// badge change itself is the feedback. All list queries are patched (not just the
// active tab's) since `["leads", "list"]` matches every cached params variant.

function snapshotLeadLists(queryClient: QueryClient) {
  return queryClient.getQueriesData<ListResponse<LeadRead>>({ queryKey: ["leads", "list"] });
}

function findLeadInLists(queryClient: QueryClient, id: string): LeadRead | undefined {
  for (const [, data] of snapshotLeadLists(queryClient)) {
    const found = data?.items.find((lead) => lead.id === id);
    if (found) return found;
  }
  return undefined;
}

function patchLeadInLists(queryClient: QueryClient, id: string, patch: Partial<LeadRead>) {
  queryClient.setQueriesData<ListResponse<LeadRead>>({ queryKey: ["leads", "list"] }, (old) =>
    old ? { ...old, items: old.items.map((lead) => (lead.id === id ? { ...lead, ...patch } : lead)) } : old,
  );
}

function useInlineLeadEdit<TVars>(
  id: string,
  mutationFn: (vars: TVars) => Promise<LeadRead>,
  toPatch: (vars: TVars) => Partial<LeadRead>,
  describe: (vars: TVars) => string,
  errorFallback: string,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onMutate: async (vars: TVars) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.leads.all });
      const patch = toPatch(vars);
      const previous = findLeadInLists(queryClient, id);
      const snapshots = snapshotLeadLists(queryClient);
      patchLeadInLists(queryClient, id, patch);
      return { snapshots, previous, patch };
    },
    onSuccess: (_data, vars, context) => {
      if (!context?.previous) return;
      const previous = context.previous;
      const changed = (Object.keys(context.patch) as (keyof LeadRead)[]).some((key) => previous[key] !== context.patch[key]);
      if (!changed) return;
      const revertPatch = Object.fromEntries(
        (Object.keys(context.patch) as (keyof LeadRead)[]).map((key) => [key, previous[key]]),
      ) as LeadUpdatePayload;
      toast.success(describe(vars), {
        action: {
          label: "Undo",
          onClick: () => {
            leadService.update(id, revertPatch).then(() => queryClient.invalidateQueries({ queryKey: queryKeys.leads.all }));
          },
        },
      });
    },
    onError: (error, _vars, context) => {
      context?.snapshots.forEach(([key, data]) => queryClient.setQueryData(key, data));
      toast.error(getErrorMessage(error, errorFallback));
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.leads.all }),
  });
}

export function useInlinePriority(id: string) {
  return useInlineLeadEdit(
    id,
    (priority: LeadPriority) => leadService.update(id, { priority }),
    (priority) => ({ priority }),
    (priority) => `Priority set to ${toTitleCase(priority)}`,
    "Couldn't update priority",
  );
}

export function useInlineStatus(id: string) {
  return useInlineLeadEdit(
    id,
    (status: string) => leadService.changeStatus(id, status),
    (status) => ({ status: status as LeadRead["status"] }),
    (status) => `Status set to ${toTitleCase(status)}`,
    "Couldn't update status",
  );
}

export function useInlineAssign(id: string) {
  return useInlineLeadEdit(
    id,
    (assignedTo: string) => leadService.assign(id, assignedTo),
    (assignedTo) => ({ assigned_to: assignedTo }),
    () => "Lead assigned",
    "Couldn't assign lead",
  );
}

// One field, submitted the instant it happened: create the attempt and resolve it in
// the same beat rather than making the user schedule-then-complete separately. An
// unresolved ("not completed") log auto-schedules its own next-follow-up reminder —
// scaled by priority — instead of asking the user to pick a date.
export function useQuickFollowUp(leadId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ notes, completed, priority }: { notes: string; completed: boolean; priority: LeadPriority }) => {
      const now = new Date();
      const followUp = await leadService.createFollowUp(leadId, {
        scheduled_at: now.toISOString(),
        method: FollowUpMethod.PHONE_CALL,
        notes,
      });
      const nextFollowUpAt = completed
        ? undefined
        : new Date(now.getTime() + NEXT_FOLLOW_UP_GAP_DAYS[priority] * 86_400_000).toISOString();
      return leadService.completeFollowUp(leadId, followUp.id, {
        notes,
        completed_at: now.toISOString(),
        next_follow_up_at: nextFollowUpAt,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.all });
      queryClient.invalidateQueries({ queryKey: ["leads", "follow-ups", leadId] });
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.activities(leadId) });
      toast.success("Follow-up logged");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Couldn't log follow-up")),
  });
}

// --- Follow-ups -----------------------------------------------------------

export function useLeadFollowUps(leadId: string | undefined) {
  return useQuery({
    queryKey: ["leads", "follow-ups", leadId ?? ""],
    queryFn: () => leadService.listFollowUps(leadId as string),
    enabled: Boolean(leadId),
  });
}

export function useCreateFollowUp(leadId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: LeadFollowUpCreatePayload) => leadService.createFollowUp(leadId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads", "follow-ups", leadId] });
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.activities(leadId) });
      toast.success("Follow-up scheduled");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Couldn't schedule follow-up")),
  });
}

export function useCompleteFollowUp(leadId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ followUpId, payload }: { followUpId: string; payload: LeadFollowUpCompletePayload }) =>
      leadService.completeFollowUp(leadId, followUpId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads", "follow-ups", leadId] });
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.activities(leadId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.detail(leadId) });
      toast.success("Follow-up completed");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Couldn't complete follow-up")),
  });
}

export function useDueFollowUps(
  params: { page?: number; limit?: number; counsellor_id?: string } = {},
  options: { refetchInterval?: number } = {},
) {
  return useQuery({
    queryKey: ["leads", "follow-ups", "due", params],
    queryFn: () => leadService.listDueFollowUps(params),
    refetchInterval: options.refetchInterval,
  });
}
