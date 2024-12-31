/**
 * Paymongo API Types and Interfaces
 * Based on Paymongo Checkout Sessions API
 * @see https://developers.paymongo.com/reference/checkout-session-resource
 */

/**
 * Billing address for Paymongo checkout
 */
export interface PaymongoBillingAddress {
  city?: string;
  country: string;
  line1: string;
  line2?: string;
  postal_code?: string;
  state?: string;
}

/**
 * Billing information for checkout
 */
export interface PaymongoBilling {
  address?: PaymongoBillingAddress;
  email: string;
  name: string;
  phone?: string;
}

/**
 * Line item for checkout
 */
export interface PaymongoLineItem {
  amount: number; // Amount in centavos (e.g., 10000 = ₱100.00)
  currency: string;
  description?: string;
  images?: string[];
  name: string;
  quantity: number;
}

/**
 * Payment source info (card, gcash, etc.)
 */
export interface PaymongoPaymentSource {
  id: string;
  type: string;
  brand?: string;
  country?: string;
  last4?: string;
}

/**
 * Tax information
 */
export interface PaymongoTax {
  amount: number;
  currency: string;
  inclusive: boolean;
  name: string;
  type: string;
  value: string;
}

/**
 * Individual payment within a checkout session
 */
export interface PaymongoPayment {
  id: string;
  type: 'payment';
  attributes: {
    access_url: string | null;
    amount: number; // In centavos
    balance_transaction_id: string;
    billing: PaymongoBilling;
    currency: string;
    description: string;
    disputed: boolean;
    external_reference_number: string | null;
    fee: number; // Platform fee in centavos
    foreign_fee?: number;
    livemode: boolean;
    net_amount: number; // Amount after fees
    origin: string;
    payment_intent_id: string;
    payout: unknown | null;
    source: PaymongoPaymentSource;
    statement_descriptor: string;
    status: 'pending' | 'paid' | 'failed';
    tax_amount?: number;
    metadata?: Record<string, string>;
    refunds: unknown[];
    taxes?: PaymongoTax[];
    available_at: number;
    created_at: number;
    credited_at?: number;
    paid_at?: number;
    updated_at: number;
  };
}

/**
 * Payment intent within checkout session
 */
export interface PaymongoPaymentIntent {
  id: string;
  type: 'payment_intent';
  attributes: {
    amount: number;
    capture_type: string;
    client_key: string;
    currency: string;
    description: string;
    livemode: boolean;
    statement_descriptor: string;
    status: 'awaiting_payment_method' | 'awaiting_next_action' | 'processing' | 'succeeded' | 'failed';
    last_payment_error: unknown | null;
    payment_method_allowed: string[];
    payments: PaymongoPayment[];
    next_action: unknown | null;
    payment_method_options?: Record<string, unknown>;
    metadata?: Record<string, string>;
    setup_future_usage: unknown | null;
    created_at: number;
    updated_at: number;
  };
}

/**
 * Checkout session status
 */
export type PaymongoCheckoutStatus = 'active' | 'expired' | 'paid';

/**
 * Complete checkout session resource
 */
export interface PaymongoCheckoutSession {
  id: string;
  type: 'checkout_session';
  attributes: {
    billing?: PaymongoBilling;
    cancel_url?: string;
    checkout_url: string;
    client_key: string;
    description?: string;
    line_items: PaymongoLineItem[];
    livemode: boolean;
    merchant: string;
    payments: PaymongoPayment[];
    payment_intent: PaymongoPaymentIntent | null;
    payment_method_types: string[];
    reference_number?: string;
    send_email_receipt: boolean;
    show_description: boolean;
    show_line_items: boolean;
    status: PaymongoCheckoutStatus;
    success_url: string;
    created_at: number;
    updated_at: number;
    metadata?: Record<string, string>;
  };
}

/**
 * Paymongo API response wrapper
 */
export interface PaymongoApiResponse<T> {
  data: T;
}

/**
 * Create checkout session request body
 */
export interface CreateCheckoutSessionRequest {
  data: {
    attributes: {
      billing?: PaymongoBilling;
      cancel_url?: string;
      description?: string;
      line_items: PaymongoLineItem[];
      payment_method_types: string[];
      reference_number?: string;
      send_email_receipt?: boolean;
      show_description?: boolean;
      show_line_items?: boolean;
      success_url: string;
      metadata?: Record<string, string>;
    };
  };
}

/**
 * Webhook event types
 */
export type PaymongoWebhookEventType =
  | 'checkout_session.payment.paid'
  | 'payment.paid'
  | 'payment.failed'
  | 'payment.refunded'
  | 'payment.refund.updated';

/**
 * Webhook event structure
 */
export interface PaymongoWebhookEvent {
  id: string;
  type: PaymongoWebhookEventType;
  livemode: boolean;
  data: {
    id: string;
    type: string;
    attributes: PaymongoCheckoutSession['attributes'] | PaymongoPayment['attributes'];
  };
  created_at: number;
  updated_at: number;
}

/**
 * Error response from Paymongo API
 */
export interface PaymongoError {
  code: string;
  detail: string;
  source?: {
    pointer: string;
    attribute: string;
  };
}

export interface PaymongoErrorResponse {
  errors: PaymongoError[];
}
