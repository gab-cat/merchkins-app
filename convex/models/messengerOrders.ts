import { defineTable } from 'convex/server';
import { v } from 'convex/values';

/**
 * Messenger Order Sessions - Tracks order flow state for multi-step conversation ordering
 */
export const messengerOrderSessions = defineTable({
  chatwootConversationId: v.number(),
  chatwootAccountId: v.number(),
  chatwootContactId: v.number(),
  organizationId: v.optional(v.id('organizations')),

  // Product selection
  productId: v.optional(v.id('products')),
  productCode: v.optional(v.string()),
  variantId: v.optional(v.string()),
  sizeId: v.optional(v.string()),
  quantity: v.optional(v.number()),
  notes: v.optional(v.string()),

  // User linking
  userId: v.optional(v.id('users')),
  email: v.optional(v.string()),

  // Flow state
  currentStep: v.union(
    v.literal('VARIANT_SELECTION'),
    v.literal('SIZE_SELECTION'),
    v.literal('QUANTITY_INPUT'),
    v.literal('NOTES_INPUT'),
    v.literal('EMAIL_INPUT'),
    v.literal('OTP_VERIFICATION'),
    v.literal('CHECKOUT'),
    v.literal('COMPLETED'),
    v.literal('CANCELLED')
  ),

  // Order result
  orderId: v.optional(v.id('orders')),

  expiresAt: v.number(),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index('by_conversation', ['chatwootConversationId'])
  .index('by_contact', ['chatwootContactId'])
  .index('by_order', ['orderId'])
  .index('by_expires', ['expiresAt']);

/**
 * Email Verification Codes - OTP codes for Messenger email verification
 */
export const emailVerificationCodes = defineTable({
  email: v.string(),
  code: v.string(),
  chatwootContactId: v.optional(v.number()),
  expiresAt: v.number(),
  attempts: v.number(),
  verified: v.boolean(),
  createdAt: v.number(),
})
  .index('by_email', ['email'])
  .index('by_expires', ['expiresAt']);
