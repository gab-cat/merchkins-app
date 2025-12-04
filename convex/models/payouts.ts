import { defineTable } from 'convex/server';
import { v } from 'convex/values';

/**
 * Payout Invoices - Generated weekly for each organization
 *
 * Cut-off period: Wednesday 00:00 UTC to Tuesday 23:59:59 UTC
 * Payout day: Friday (manual processing by super-admin)
 */
export const payoutInvoices = defineTable({
  // Reference
  organizationId: v.id('organizations'),
  invoiceNumber: v.string(), // Format: PI-{YYYYMMDD}-{orgSlug}-{sequence}

  // Embedded organization info for quick access
  organizationInfo: v.object({
    name: v.string(),
    slug: v.string(),
    logo: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    bankDetails: v.optional(
      v.object({
        bankName: v.string(),
        accountName: v.string(),
        accountNumber: v.string(),
        bankCode: v.optional(v.string()), // For automated payouts
        notificationEmail: v.optional(v.string()), // Email to receive payout notifications
      })
    ),
  }),

  // Period covered (Wednesday 00:00 to Tuesday 23:59:59)
  periodStart: v.number(), // Wednesday 00:00:00 UTC timestamp
  periodEnd: v.number(), // Tuesday 23:59:59 UTC timestamp

  // Financial summary
  grossAmount: v.number(), // Total sales from PAID orders
  platformFeePercentage: v.number(), // Percentage applied (e.g., 15)
  platformFeeAmount: v.number(), // Platform fee deducted
  netAmount: v.number(), // Amount to be paid out to org

  // Order summary
  orderCount: v.number(),
  itemCount: v.number(),

  // Embedded order details for invoice
  orderSummary: v.array(
    v.object({
      orderId: v.id('orders'),
      orderNumber: v.string(),
      orderDate: v.number(),
      customerName: v.string(),
      totalAmount: v.number(),
      itemCount: v.number(),
    })
  ),

  // Status
  status: v.union(v.literal('PENDING'), v.literal('PROCESSING'), v.literal('PAID'), v.literal('CANCELLED')),

  // Payment info (filled when paid)
  paidAt: v.optional(v.number()),
  paidById: v.optional(v.id('users')), // Super-admin who marked as paid
  paidByInfo: v.optional(
    v.object({
      firstName: v.optional(v.string()),
      lastName: v.optional(v.string()),
      email: v.string(),
    })
  ),
  paymentReference: v.optional(v.string()), // Bank reference number
  paymentNotes: v.optional(v.string()),

  // PDF storage
  pdfStorageKey: v.optional(v.string()), // R2 storage key for PDF
  invoiceUrl: v.optional(v.string()), // Public URL for invoice PDF

  // Email tracking
  invoiceEmailSentAt: v.optional(v.number()),
  paymentEmailSentAt: v.optional(v.number()),

  // Status history
  statusHistory: v.array(
    v.object({
      status: v.string(),
      changedBy: v.optional(v.id('users')),
      changedByName: v.optional(v.string()),
      reason: v.optional(v.string()),
      changedAt: v.number(),
    })
  ),

  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index('by_organization', ['organizationId'])
  .index('by_status', ['status'])
  .index('by_period_start', ['periodStart'])
  .index('by_period_end', ['periodEnd'])
  .index('by_invoice_number', ['invoiceNumber'])
  .index('by_organization_status', ['organizationId', 'status'])
  .index('by_organization_period', ['organizationId', 'periodStart'])
  .index('by_created_at', ['createdAt']);

/**
 * Payout Settings - Platform-wide payout configuration
 * This is a singleton table (only one record)
 */
export const payoutSettings = defineTable({
  // Default platform fee percentage (if org doesn't have custom)
  defaultPlatformFeePercentage: v.number(), // Default: 15

  // Payout schedule
  cutoffDayOfWeek: v.number(), // 0=Sunday, 1=Monday, ..., 3=Wednesday
  payoutDayOfWeek: v.number(), // 0=Sunday, ..., 5=Friday

  // Email settings
  sendInvoiceEmails: v.boolean(),
  sendPaymentEmails: v.boolean(),

  // Minimum payout threshold (optional)
  minimumPayoutAmount: v.optional(v.number()),

  // Last cron run info
  lastCronRunAt: v.optional(v.number()),
  lastCronRunStatus: v.optional(v.string()),
  lastCronRunInvoicesGenerated: v.optional(v.number()),

  updatedAt: v.number(),
  updatedById: v.optional(v.id('users')),
});
