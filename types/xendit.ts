/**
 * Xendit API Types and Interfaces
 */

export interface XenditInvoiceResponse {
  id: string;
  external_id: string;
  user_id: string;
  status: "PENDING" | "PAID" | "EXPIRED" | "FAILED";
  merchant_name: string;
  merchant_profile_picture_url: string;
  amount: number;
  payer_email: string;
  description: string;
  expiry_date: string;
  invoice_url: string;
  available_banks?: Array<{
    bank_code: string;
    collection_type: string;
    bank_account_number: string;
    transfer_amount: number;
    bank_branch: string;
    account_holder_name: string;
    identity_amount: number;
  }>;
  available_retail_outlets?: Array<{
    retail_outlet_name: string;
    payment_code: string;
    transfer_amount: number;
  }>;
  available_ewallets?: Array<{
    ewallet_type: string;
  }>;
  available_qr_codes?: Array<{
    qr_string: string;
  }>;
  available_paylaters?: Array<{
    paylater_type: string;
  }>;
  should_exclude_credit_card?: boolean;
  should_send_email?: boolean;
  created: string;
  updated: string;
  currency: string;
  customer?: {
    given_names: string;
    surname?: string;
    email: string;
    mobile_number?: string;
    addresses?: Array<{
      city: string;
      country: string;
      postal_code: string;
      state: string;
      street_line1: string;
      street_line2?: string;
    }>;
  };
  customer_notification_preference?: {
    invoice_created?: Array<string>;
    invoice_reminder?: Array<string>;
    invoice_paid?: Array<string>;
    invoice_expired?: Array<string>;
  };
  success_redirect_url?: string;
  failure_redirect_url?: string;
  paid_at?: string;
  credit_card_charge_id?: string;
  payment_method?: string;
  payment_channel?: string;
  payment_destination?: string;
  paid_amount?: number;
  adjusted_received_amount?: number;
  fees_paid_amount?: number;
  fees_paid_amount_breakdown?: Array<{
    type: string;
    amount: number;
  }>;
}

export interface XenditWebhookEvent {
  id: string;
  external_id: string;
  user_id: string;
  status: "PENDING" | "PAID" | "EXPIRED" | "FAILED";
  merchant_name: string;
  merchant_profile_picture_url: string;
  amount: number;
  payer_email: string;
  description: string;
  expiry_date: string;
  invoice_url: string;
  available_banks?: Array<{
    bank_code: string;
    collection_type: string;
    bank_account_number: string;
    transfer_amount: number;
    bank_branch: string;
    account_holder_name: string;
    identity_amount: number;
  }>;
  available_retail_outlets?: Array<{
    retail_outlet_name: string;
    payment_code: string;
    transfer_amount: number;
  }>;
  available_ewallets?: Array<{
    ewallet_type: string;
  }>;
  available_qr_codes?: Array<{
    qr_string: string;
  }>;
  available_paylaters?: Array<{
    paylater_type: string;
  }>;
  should_exclude_credit_card?: boolean;
  should_send_email?: boolean;
  created: string;
  updated: string;
  currency: string;
  customer?: {
    given_names: string;
    surname?: string;
    email: string;
    mobile_number?: string;
    addresses?: Array<{
      city: string;
      country: string;
      postal_code: string;
      state: string;
      street_line1: string;
      street_line2?: string;
    }>;
  };
  customer_notification_preference?: {
    invoice_created?: Array<string>;
    invoice_reminder?: Array<string>;
    invoice_paid?: Array<string>;
    invoice_expired?: Array<string>;
  };
  success_redirect_url?: string;
  failure_redirect_url?: string;
  paid_at?: string;
  credit_card_charge_id?: string;
  payment_method?: string;
  payment_channel?: string;
  payment_destination?: string;
  paid_amount?: number;
  adjusted_received_amount?: number;
  fees_paid_amount?: number;
  fees_paid_amount_breakdown?: Array<{
    type: string;
    amount: number;
  }>;
  // Webhook specific fields
  event?: string;
  business_id?: string;
  payment_id?: string;
}
