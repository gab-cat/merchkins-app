// Chatwoot Order Flow - Session Manager
// CRUD operations for messengerOrderSessions table

import { v } from 'convex/values';
import { MutationCtx, QueryCtx, internalMutation, internalQuery } from '../../_generated/server';
import { Id } from '../../_generated/dataModel';
import { OrderSessionStep } from './types';

// Session expiry: 30 minutes
const SESSION_EXPIRY_MS = 30 * 60 * 1000;

// ============= QUERIES =============

export const getActiveSessionArgs = {
  conversationId: v.number(),
};

export const getActiveSessionHandler = async (ctx: QueryCtx, args: { conversationId: number }) => {
  const now = Date.now();
  const session = await ctx.db
    .query('messengerOrderSessions')
    .withIndex('by_conversation', (q) => q.eq('chatwootConversationId', args.conversationId))
    .filter((q) => q.and(q.gt(q.field('expiresAt'), now), q.neq(q.field('currentStep'), 'COMPLETED'), q.neq(q.field('currentStep'), 'CANCELLED')))
    .first();

  return session;
};

export const getActiveSession = internalQuery({
  args: getActiveSessionArgs,
  returns: v.union(
    v.object({
      _id: v.id('messengerOrderSessions'),
      _creationTime: v.number(),
      chatwootConversationId: v.number(),
      chatwootAccountId: v.number(),
      chatwootContactId: v.number(),
      organizationId: v.optional(v.id('organizations')),
      productId: v.optional(v.id('products')),
      productCode: v.optional(v.string()),
      variantId: v.optional(v.string()),
      sizeId: v.optional(v.string()),
      quantity: v.optional(v.number()),
      notes: v.optional(v.string()),
      userId: v.optional(v.id('users')),
      email: v.optional(v.string()),
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
      orderId: v.optional(v.id('orders')),
      expiresAt: v.number(),
      createdAt: v.number(),
      updatedAt: v.number(),
    }),
    v.null()
  ),
  handler: getActiveSessionHandler,
});

// Query to get session by order ID (for payment confirmation)
export const getSessionByOrderIdArgs = {
  orderId: v.id('orders'),
};

export const getSessionByOrderId = internalQuery({
  args: getSessionByOrderIdArgs,
  returns: v.union(
    v.object({
      _id: v.id('messengerOrderSessions'),
      chatwootConversationId: v.number(),
      chatwootAccountId: v.number(),
      chatwootContactId: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query('messengerOrderSessions')
      .withIndex('by_order', (q) => q.eq('orderId', args.orderId))
      .first();

    if (!session) return null;

    return {
      _id: session._id,
      chatwootConversationId: session.chatwootConversationId,
      chatwootAccountId: session.chatwootAccountId,
      chatwootContactId: session.chatwootContactId,
    };
  },
});

export const getUserByContactArgs = {
  chatwootContactId: v.number(),
};

export const getUserByContactHandler = async (ctx: QueryCtx, args: { chatwootContactId: number }) => {
  const user = await ctx.db
    .query('users')
    .withIndex('by_chatwoot_contact', (q) => q.eq('chatwootContactId', args.chatwootContactId))
    .filter((q) => q.eq(q.field('isDeleted'), false))
    .first();

  return user;
};

export const getUserByContact = internalQuery({
  args: getUserByContactArgs,
  returns: v.union(
    v.object({
      _id: v.id('users'),
      _creationTime: v.number(),
      email: v.string(),
      firstName: v.optional(v.string()),
      lastName: v.optional(v.string()),
      chatwootContactId: v.optional(v.number()),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const user = await getUserByContactHandler(ctx, args);
    if (!user) return null;
    return {
      _id: user._id,
      _creationTime: user._creationTime,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      chatwootContactId: user.chatwootContactId,
    };
  },
});

// ============= MUTATIONS =============

export const createSessionArgs = {
  chatwootConversationId: v.number(),
  chatwootAccountId: v.number(),
  chatwootContactId: v.number(),
  organizationId: v.optional(v.id('organizations')),
  productId: v.id('products'),
  productCode: v.optional(v.string()),
  userId: v.optional(v.id('users')),
  email: v.optional(v.string()),
};

export const createSessionHandler = async (
  ctx: MutationCtx,
  args: {
    chatwootConversationId: number;
    chatwootAccountId: number;
    chatwootContactId: number;
    organizationId?: Id<'organizations'>;
    productId: Id<'products'>;
    productCode?: string;
    userId?: Id<'users'>;
    email?: string;
  }
) => {
  const now = Date.now();

  // Cancel any existing active sessions for this conversation
  const existingSessions = await ctx.db
    .query('messengerOrderSessions')
    .withIndex('by_conversation', (q) => q.eq('chatwootConversationId', args.chatwootConversationId))
    .filter((q) => q.and(q.neq(q.field('currentStep'), 'COMPLETED'), q.neq(q.field('currentStep'), 'CANCELLED')))
    .collect();

  for (const session of existingSessions) {
    await ctx.db.patch(session._id, {
      currentStep: 'CANCELLED',
      updatedAt: now,
    });
  }

  // Create new session
  const sessionId = await ctx.db.insert('messengerOrderSessions', {
    chatwootConversationId: args.chatwootConversationId,
    chatwootAccountId: args.chatwootAccountId,
    chatwootContactId: args.chatwootContactId,
    organizationId: args.organizationId,
    productId: args.productId,
    productCode: args.productCode,
    userId: args.userId,
    email: args.email,
    currentStep: 'VARIANT_SELECTION',
    expiresAt: now + SESSION_EXPIRY_MS,
    createdAt: now,
    updatedAt: now,
  });

  return sessionId;
};

export const createSession = internalMutation({
  args: createSessionArgs,
  returns: v.id('messengerOrderSessions'),
  handler: createSessionHandler,
});

export const updateSessionArgs = {
  sessionId: v.id('messengerOrderSessions'),
  currentStep: v.optional(
    v.union(
      v.literal('VARIANT_SELECTION'),
      v.literal('SIZE_SELECTION'),
      v.literal('QUANTITY_INPUT'),
      v.literal('NOTES_INPUT'),
      v.literal('EMAIL_INPUT'),
      v.literal('OTP_VERIFICATION'),
      v.literal('CHECKOUT'),
      v.literal('COMPLETED'),
      v.literal('CANCELLED')
    )
  ),
  variantId: v.optional(v.string()),
  sizeId: v.optional(v.string()),
  quantity: v.optional(v.number()),
  notes: v.optional(v.string()),
  email: v.optional(v.string()),
  userId: v.optional(v.id('users')),
  orderId: v.optional(v.id('orders')),
};

export const updateSessionHandler = async (
  ctx: MutationCtx,
  args: {
    sessionId: Id<'messengerOrderSessions'>;
    currentStep?: OrderSessionStep;
    variantId?: string;
    sizeId?: string;
    quantity?: number;
    notes?: string;
    email?: string;
    userId?: Id<'users'>;
    orderId?: Id<'orders'>;
  }
) => {
  const now = Date.now();
  const { sessionId, ...updates } = args;

  const updateData: Record<string, unknown> = {
    ...updates,
    updatedAt: now,
  };

  // Extend expiry on each update
  updateData.expiresAt = now + SESSION_EXPIRY_MS;

  await ctx.db.patch(sessionId, updateData);

  return sessionId;
};

export const updateSession = internalMutation({
  args: updateSessionArgs,
  returns: v.id('messengerOrderSessions'),
  handler: updateSessionHandler,
});
