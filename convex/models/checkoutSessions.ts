import { defineTable } from 'convex/server';
import { v } from 'convex/values';

// Checkout sessions for grouped payments
export const checkoutSessions = defineTable({
  checkoutId: v.string(),
  customerId: v.id('users'),
  orderIds: v.array(v.id('orders')),
  totalAmount: v.number(),
  xenditInvoiceId: v.optional(v.string()),
  xenditInvoiceUrl: v.optional(v.string()),
  xenditInvoiceExpiryDate: v.optional(v.number()),
  xenditInvoiceCreatedAt: v.optional(v.number()),
  status: v.union(v.literal('PENDING'), v.literal('PAID'), v.literal('EXPIRED'), v.literal('CANCELLED')),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index('by_customer', ['customerId'])
  .index('by_status', ['status'])
  .index('by_invoice_id', ['xenditInvoiceId'])
  .index('by_checkout_id', ['checkoutId']);
