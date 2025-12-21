// Chatwoot Order Flow - Type Definitions

import { Id } from '../../_generated/dataModel';

// Order session steps
export type OrderSessionStep =
  | 'VARIANT_SELECTION'
  | 'SIZE_SELECTION'
  | 'QUANTITY_INPUT'
  | 'NOTES_INPUT'
  | 'EMAIL_INPUT'
  | 'OTP_VERIFICATION'
  | 'CHECKOUT'
  | 'COMPLETED'
  | 'CANCELLED';

// Session data structure
export interface OrderSession {
  _id: Id<'messengerOrderSessions'>;
  chatwootConversationId: number;
  chatwootAccountId: number;
  chatwootContactId: number;
  organizationId?: Id<'organizations'>;
  productId?: Id<'products'>;
  productCode?: string;
  variantId?: string;
  sizeId?: string;
  quantity?: number;
  notes?: string;
  userId?: Id<'users'>;
  email?: string;
  currentStep: OrderSessionStep;
  orderId?: Id<'orders'>;
  expiresAt: number;
  createdAt: number;
  updatedAt: number;
}

// Product variant for selection
export interface ProductVariantOption {
  variantId: string;
  variantName: string;
  price: number;
  imageUrl?: string;
  hasSizes: boolean;
  isAvailable: boolean;
}

// Size option for selection
export interface SizeOption {
  sizeId: string;
  label: string;
  price?: number;
  isAvailable: boolean;
}

// Chatwoot input_select item
export interface InputSelectItem {
  title: string;
  value: string;
}

// Chatwoot message payload types
export interface TextMessagePayload {
  content: string;
  content_type: 'text';
  message_type: 'outgoing';
  private: boolean;
}

export interface InputSelectPayload {
  content: string;
  content_type: 'input_select';
  content_attributes: {
    items: InputSelectItem[];
  };
  message_type: 'outgoing';
  private: boolean;
}

export type ChatwootMessagePayload = TextMessagePayload | InputSelectPayload;

// Order flow context passed between handlers
export interface OrderFlowContext {
  conversationId: number;
  accountId: number;
  contactId: number;
  inboxName?: string;
  organizationId?: Id<'organizations'>;
  botToken: string;
}

// Product info for order flow
export interface ProductForOrder {
  _id: Id<'products'>;
  title: string;
  slug: string;
  code?: string;
  organizationId?: Id<'organizations'>;
  organizationInfo?: {
    name: string;
    slug: string;
  };
  variants: Array<{
    isActive: boolean;
    variantId: string;
    variantName: string;
    price: number;
    inventory: number;
    imageUrl?: string;
    sizes?: Array<{
      id: string;
      label: string;
      price?: number;
      inventory?: number;
    }>;
  }>;
  imageUrl: string[];
  minPrice?: number;
  maxPrice?: number;
}
