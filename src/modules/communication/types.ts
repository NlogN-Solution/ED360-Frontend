import type { CommunicationKind } from "@/types/enums";

export interface ConversationListItem {
  id: string;
  kind: CommunicationKind;
  display_name: string;
  last_message_preview: string | null;
  last_message_at: string | null;
  unread_count: number;
}

export interface ConversationListResponse {
  items: ConversationListItem[];
}

export interface ConversationCreatePayload {
  kind: CommunicationKind;
  participant_id?: string;
}

export interface MessageRead {
  id: string;
  conversation_id: string;
  sender_id: string | null;
  body: string;
  created_at: string | null;
}

export interface MessageCreatePayload {
  body: string;
}

export interface UnreadCountResponse {
  unread_count: number;
}
