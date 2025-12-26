import { defineTable } from 'convex/server';
import { v } from 'convex/values';

/**
 * Voucher Refund Requests
 * Tracks customer requests for converting refund vouchers to monetary refunds
 * Only applicable to seller-initiated refund vouchers after 14 days
 */
export const voucherRefundRequests = defineTable({
  isDeleted: v.boolean(),
  voucherId: v.id('vouchers'),
  requestedById: v.id('users'),

  // Request status
  status: v.union(v.literal('PENDING'), v.literal('APPROVED'), v.literal('REJECTED'), v.literal('TRANSFERRED')),

  // Amount to refund (should match voucher value)
  amount: v.number(),

  // Customer's message/reason for requesting monetary refund
  customerMessage: v.optional(v.string()),

  // Admin response message
  adminMessage: v.optional(v.string()),

  // Customer's bank details for transfer
  bankDetails: v.object({
    accountName: v.string(),
    accountNumber: v.string(),
    bankName: v.string(),
  }),

  // Review information (when approved/rejected by super-admin)
  reviewedById: v.optional(v.id('users')),
  reviewedAt: v.optional(v.number()),
  reviewerInfo: v.optional(
    v.object({
      firstName: v.optional(v.string()),
      lastName: v.optional(v.string()),
      email: v.string(),
      imageUrl: v.optional(v.string()),
    })
  ),

  // Transfer tracking (when money is actually sent)
  transferReferenceNumber: v.optional(v.string()),
  transferredAt: v.optional(v.number()),
  transferredById: v.optional(v.id('users')),
  transferNotes: v.optional(v.string()),
  transferredByInfo: v.optional(
    v.object({
      firstName: v.optional(v.string()),
      lastName: v.optional(v.string()),
      email: v.string(),
      imageUrl: v.optional(v.string()),
    })
  ),

  // Embedded voucher info for quick access
  voucherInfo: v.object({
    code: v.string(),
    discountValue: v.number(),
    sourceOrderId: v.optional(v.id('orders')),
  }),

  // Embedded customer info
  customerInfo: v.object({
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    email: v.string(),
    phone: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  }),

  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index('by_voucher', ['voucherId'])
  .index('by_requestedBy', ['requestedById'])
  .index('by_status', ['status'])
  .index('by_isDeleted', ['isDeleted'])
  .index('by_createdAt', ['createdAt']);
