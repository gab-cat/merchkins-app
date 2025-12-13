import { defineTable } from 'convex/server';
import { v } from 'convex/values';

/**
 * Refund reason categories
 */
export const refundReasonValues = v.union(
  v.literal('WRONG_SIZE'),
  v.literal('WRONG_ITEM'),
  v.literal('WRONG_PAYMENT'),
  v.literal('DEFECTIVE_ITEM'),
  v.literal('NOT_AS_DESCRIBED'),
  v.literal('CHANGED_MIND'),
  v.literal('DUPLICATE_ORDER'),
  v.literal('DELIVERY_ISSUE'),
  v.literal('OTHER')
);

export type RefundReason =
  | 'WRONG_SIZE'
  | 'WRONG_ITEM'
  | 'WRONG_PAYMENT'
  | 'DEFECTIVE_ITEM'
  | 'NOT_AS_DESCRIBED'
  | 'CHANGED_MIND'
  | 'DUPLICATE_ORDER'
  | 'DELIVERY_ISSUE'
  | 'OTHER';

export const REFUND_REASON_LABELS: Record<RefundReason, string> = {
  WRONG_SIZE: 'Wrong Size',
  WRONG_ITEM: 'Wrong Item Received',
  WRONG_PAYMENT: 'Wrong Payment Method',
  DEFECTIVE_ITEM: 'Defective/Damaged Item',
  NOT_AS_DESCRIBED: 'Item Not as Described',
  CHANGED_MIND: 'Changed My Mind',
  DUPLICATE_ORDER: 'Duplicate Order',
  DELIVERY_ISSUE: 'Delivery Issue',
  OTHER: 'Other',
};

/**
 * Refund requests table
 * Tracks customer requests for order refunds/cancellations
 */
export const refundRequests = defineTable({
  isDeleted: v.boolean(),
  orderId: v.id('orders'),
  requestedById: v.id('users'),
  organizationId: v.id('organizations'),

  // Request details
  status: v.union(v.literal('PENDING'), v.literal('APPROVED'), v.literal('REJECTED')),
  reason: v.optional(refundReasonValues), // Category dropdown - null means OTHER for backward compatibility
  customerMessage: v.optional(v.string()), // Optional additional details
  adminMessage: v.optional(v.string()),
  refundAmount: v.number(),

  // Voucher created on approval
  voucherId: v.optional(v.id('vouchers')),

  // Review information
  reviewedById: v.optional(v.id('users')),
  reviewedAt: v.optional(v.number()),

  // Embedded order info for quick access
  orderInfo: v.object({
    orderNumber: v.optional(v.string()),
    totalAmount: v.number(),
    status: v.string(),
    paymentStatus: v.string(),
    orderDate: v.number(),
  }),

  // Embedded customer info
  customerInfo: v.object({
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    email: v.string(),
    phone: v.string(),
    imageUrl: v.optional(v.string()),
  }),

  // Embedded organization info
  organizationInfo: v.object({
    name: v.string(),
    slug: v.string(),
    logo: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
  }),

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
  .index('by_order', ['orderId'])
  .index('by_requestedBy', ['requestedById'])
  .index('by_organization', ['organizationId'])
  .index('by_status', ['status'])
  .index('by_isDeleted', ['isDeleted'])
  .index('by_organization_status', ['organizationId', 'status'])
  .index('by_reviewedBy', ['reviewedById'])
  .index('by_createdAt', ['createdAt']);
