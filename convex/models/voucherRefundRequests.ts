import { defineTable } from 'convex/server';
import { v } from 'convex/values';

/**
 * Voucher refund requests table
 * Tracks customer requests for monetary refunds of vouchers issued from seller-initiated cancellations
 */
export const voucherRefundRequests = defineTable({
  isDeleted: v.boolean(),
  voucherId: v.id('vouchers'),
  requestedById: v.id('users'),

  // Request details
  status: v.union(v.literal('PENDING'), v.literal('APPROVED'), v.literal('REJECTED')),
  requestedAmount: v.number(), // Amount requested for refund
  adminMessage: v.optional(v.string()), // Admin response message

  // Review information
  reviewedById: v.optional(v.id('users')),
  reviewedAt: v.optional(v.number()),

  // Embedded voucher info for quick access
  voucherInfo: v.object({
    code: v.string(),
    name: v.string(),
    discountValue: v.number(),
    cancellationInitiator: v.optional(v.string()),
    createdAt: v.number(),
    monetaryRefundEligibleAt: v.optional(v.number()),
  }),

  // Embedded customer info
  customerInfo: v.object({
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    email: v.string(),
    phone: v.string(),
    imageUrl: v.optional(v.string()),
  }),

  // Embedded order info (from source order)
  sourceOrderInfo: v.optional(
    v.object({
      orderId: v.id('orders'),
      orderNumber: v.optional(v.string()),
      totalAmount: v.number(),
    })
  ),

  // Embedded reviewer info (if reviewed)
  reviewerInfo: v.optional(
    v.object({
      firstName: v.optional(v.string()),
      lastName: v.optional(v.string()),
      email: v.string(),
      imageUrl: v.optional(v.string()),
    })
  ),

  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index('by_voucher', ['voucherId'])
  .index('by_requestedBy', ['requestedById'])
  .index('by_status', ['status'])
  .index('by_isDeleted', ['isDeleted'])
  .index('by_createdAt', ['createdAt'])
  .index('by_reviewedBy', ['reviewedById'])
  .index('by_voucher_status', ['voucherId', 'status']);

