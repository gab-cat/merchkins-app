// Chatwoot Webhook Event Types - Based on actual Chatwoot payload structure

export interface ChatwootWebhookEvent {
  event: ChatwootEventType;
  id: number;
  content: string;
  content_type?: 'text' | 'input_select' | 'cards' | 'form' | 'article';
  content_attributes?: {
    in_reply_to_external_id?: string | null;
    [key: string]: unknown;
  };
  message_type: 'incoming' | 'outgoing' | 'activity' | 'template';
  private: boolean;
  source_id?: string;
  created_at: string;
  account: ChatwootAccount;
  conversation: ChatwootConversation;
  sender: ChatwootSender;
  inbox: ChatwootInbox;
  additional_attributes?: Record<string, unknown>;
}

export type ChatwootEventType =
  | 'message_created'
  | 'message_updated'
  | 'conversation_created'
  | 'conversation_status_changed'
  | 'conversation_updated'
  | 'contact_created'
  | 'contact_updated'
  | 'webwidget_triggered';

export type ChatwootChannelType =
  | 'Channel::FacebookPage'
  | 'Channel::WebWidget'
  | 'Channel::Api'
  | 'Channel::Email'
  | 'Channel::Sms'
  | 'Channel::Whatsapp'
  | 'Channel::Telegram'
  | 'Channel::Line'
  | 'Channel::Instagram';

export interface ChatwootAccount {
  id: number;
  name: string;
}

export interface ChatwootConversation {
  id: number;
  inbox_id: number;
  status: 'open' | 'resolved' | 'pending' | 'snoozed' | 'bot';
  channel: ChatwootChannelType;
  can_reply: boolean;
  agent_last_seen_at: number;
  contact_last_seen_at: number;
  created_at: number;
  timestamp: number;
  unread_count: number;
  updated_at: number;
  waiting_since: number;
  first_reply_created_at?: string;
  last_activity_at: number;
  priority?: string | null;
  snoozed_until?: string | null;
  labels: string[];
  additional_attributes?: Record<string, unknown>;
  custom_attributes?: Record<string, unknown>;
  contact_inbox?: {
    id: number;
    contact_id: number;
    inbox_id: number;
    source_id: string;
    created_at: string;
    updated_at: string;
    hmac_verified: boolean;
    pubsub_token: string;
  };
  meta?: {
    assignee?: ChatwootAssignee;
    assignee_type?: string;
    hmac_verified?: boolean;
    sender?: ChatwootSender;
    team?: unknown;
  };
  messages?: ChatwootMessage[];
}

export interface ChatwootMessage {
  id: number;
  content: string;
  content_type?: 'text' | 'input_select' | 'cards' | 'form' | 'article';
  content_attributes?: Record<string, unknown>;
  message_type: 'incoming' | 'outgoing' | 'activity' | 'template';
  created_at: string;
  private: boolean;
  source_id?: string;
  sender?: ChatwootSender;
}

export interface ChatwootSender {
  id: number;
  name: string;
  email?: string | null;
  phone_number?: string | null;
  avatar?: string;
  thumbnail?: string;
  identifier?: string | null;
  blocked?: boolean;
  custom_attributes?: Record<string, unknown>;
  additional_attributes?: Record<string, unknown>;
  account?: ChatwootAccount;
}

export interface ChatwootAssignee {
  id: number;
  name: string;
  email?: string;
  avatar?: string;
}

export interface ChatwootInbox {
  id: number;
  name: string;
}

// API Response types
export interface ChatwootCreateMessagePayload {
  content: string;
  message_type?: 'outgoing';
  private?: boolean;
  content_type?: 'text' | 'input_select' | 'cards' | 'form';
  content_attributes?: Record<string, unknown>;
}

// Keyword Response Configuration
export interface KeywordResponse {
  keywords: string[]; // Keywords to match (case-insensitive)
  response: string; // Response text to send
  matchType: 'exact' | 'contains' | 'startsWith'; // How to match keywords
}
