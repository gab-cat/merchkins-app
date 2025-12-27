import { query } from '../../_generated/server';
import { v } from 'convex/values';
import { getCheckoutSessionByIdArgs, getCheckoutSessionByIdHandler } from './getCheckoutSessionById';

export const getCheckoutSessionById = query({
  args: getCheckoutSessionByIdArgs,
  returns: v.union(
    v.object({
      _id: v.id('checkoutSessions'),
      _creationTime: v.number(),
      checkoutId: v.string(),
      customerId: v.id('users'),
      orderIds: v.array(v.id('orders')),
      totalAmount: v.number(),
      xenditInvoiceId: v.optional(v.string()),
      xenditInvoiceUrl: v.optional(v.string()),
      xenditInvoiceExpiryDate: v.optional(v.number()),
      xenditInvoiceCreatedAt: v.optional(v.number()),
      status: v.union(v.literal('PENDING'), v.literal('PAID'), v.literal('EXPIRED'), v.literal('CANCELLED')),
      expiresAt: v.optional(v.number()),
      invoiceCreated: v.optional(v.boolean()),
      invoiceCreationAttempts: v.optional(v.number()),
      lastInvoiceAttemptAt: v.optional(v.number()),
      createdAt: v.number(),
      updatedAt: v.number(),
    }),
    v.null()
  ),
  handler: getCheckoutSessionByIdHandler,
});
