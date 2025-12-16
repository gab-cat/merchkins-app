import { defineTable } from 'convex/server';
import { v } from 'convex/values';

/**
 * Payout Adjustments - Track refunds/cancellations for orders that were already included in a payout invoice
 *
 * When an order is refunded or cancelled after being included in a payout, we create an adjustment
 * record that deducts the amount from the next payout period.
 */
export const payoutAdjustments = defineTable({
  // Reference
  organizationId: v.id('organizations'),
  orderId: v.id('orders'),
  originalInvoiceId: v.id('payoutInvoices'), // The invoice that originally included this order
  adjustmentInvoiceId: v.optional(v.id('payoutInvoices')), // The invoice where this adjustment was applied

  // Adjustment details
  type: v.union(v.literal('REFUND'), v.literal('CANCELLATION')),
  amount: v.number(), // Negative amount to deduct (e.g., -1000.00)
  reason: v.string(), // Human-readable reason for the adjustment

  // Status tracking
  status: v.union(v.literal('PENDING'), v.literal('APPLIED')),

  // Timestamps
  createdAt: v.number(), // When adjustment was created
  appliedAt: v.optional(v.number()), // When adjustment was applied to an invoice
})
  .index('by_organization', ['organizationId'])
  .index('by_order', ['orderId'])
  .index('by_original_invoice', ['originalInvoiceId'])
  .index('by_adjustment_invoice', ['adjustmentInvoiceId'])
  .index('by_status', ['status'])
  .index('by_organization_status', ['organizationId', 'status']);
