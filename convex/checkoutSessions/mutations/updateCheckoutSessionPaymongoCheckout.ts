import { v } from 'convex/values';
import { MutationCtx } from '../../_generated/server';

export const updateCheckoutSessionPaymongoCheckoutArgs = {
  checkoutId: v.string(),
  paymongoCheckoutId: v.string(),
  paymongoCheckoutUrl: v.string(),
  paymongoCheckoutExpiryDate: v.number(),
};

export const updateCheckoutSessionPaymongoCheckoutHandler = async (
  ctx: MutationCtx,
  args: {
    checkoutId: string;
    paymongoCheckoutId: string;
    paymongoCheckoutUrl: string;
    paymongoCheckoutExpiryDate: number;
  }
) => {
  const session = await ctx.db
    .query('checkoutSessions')
    .withIndex('by_checkout_id', (q) => q.eq('checkoutId', args.checkoutId))
    .first();

  if (!session) {
    throw new Error('Checkout session not found');
  }

  await ctx.db.patch(session._id, {
    paymongoCheckoutId: args.paymongoCheckoutId,
    paymongoCheckoutUrl: args.paymongoCheckoutUrl,
    paymongoCheckoutExpiryDate: args.paymongoCheckoutExpiryDate,
    paymongoCheckoutCreatedAt: Date.now(),
    updatedAt: Date.now(),
  });
};

export const updateCheckoutSessionAttemptsArgs = {
  checkoutId: v.string(),
  attempts: v.number(),
  lastAttemptAt: v.number(),
};

export const updateCheckoutSessionAttemptsHandler = async (
  ctx: MutationCtx,
  args: {
    checkoutId: string;
    attempts: number;
    lastAttemptAt: number;
  }
) => {
  const session = await ctx.db
    .query('checkoutSessions')
    .withIndex('by_checkout_id', (q) => q.eq('checkoutId', args.checkoutId))
    .first();

  if (!session) {
    throw new Error('Checkout session not found');
  }

  await ctx.db.patch(session._id, {
    invoiceCreationAttempts: args.attempts,
    lastInvoiceAttemptAt: args.lastAttemptAt,
    updatedAt: Date.now(),
  });
};

export const markCheckoutSessionInvoiceCreatedArgs = {
  checkoutId: v.string(),
};

export const markCheckoutSessionInvoiceCreatedHandler = async (ctx: MutationCtx, args: { checkoutId: string }) => {
  const session = await ctx.db
    .query('checkoutSessions')
    .withIndex('by_checkout_id', (q) => q.eq('checkoutId', args.checkoutId))
    .first();

  if (!session) {
    throw new Error('Checkout session not found');
  }

  await ctx.db.patch(session._id, {
    invoiceCreated: true,
    updatedAt: Date.now(),
  });
};
