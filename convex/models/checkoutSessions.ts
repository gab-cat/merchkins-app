import { defineTable } from 'convex/server';
import { v } from 'convex/values';

// Checkout sessions for grouped payments
export const checkoutSessions = defineTable({
  checkoutId: v.string(),
  customerId: v.id('users'),
  orderIds: v.array(v.id('orders')),
  totalAmount: v.number(),
  // Xendit fields (legacy - to be removed after migration)
  xenditInvoiceId: v.optional(v.string()),
  xenditInvoiceUrl: v.optional(v.string()),
  xenditInvoiceExpiryDate: v.optional(v.number()),
  xenditInvoiceCreatedAt: v.optional(v.number()),
  // Paymongo fields
  paymongoCheckoutId: v.optional(v.string()),
  paymongoCheckoutUrl: v.optional(v.string()),
  paymongoCheckoutExpiryDate: v.optional(v.number()),
  paymongoCheckoutCreatedAt: v.optional(v.number()),
  status: v.union(v.literal('PENDING'), v.literal('PAID'), v.literal('EXPIRED'), v.literal('CANCELLED')),
  // Security fields
  expiresAt: v.optional(v.number()), // Session expiry timestamp (24 hours from creation)
  invoiceCreated: v.optional(v.boolean()), // One-time-use flag to prevent duplicate invoice creation
  invoiceCreationAttempts: v.optional(v.number()), // Counter for rate limiting
  lastInvoiceAttemptAt: v.optional(v.number()), // Timestamp of last attempt for rate limiting window
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index('by_customer', ['customerId'])
  .index('by_status', ['status'])
  .index('by_invoice_id', ['xenditInvoiceId'])
  .index('by_checkout_id', ['checkoutId']);
