import { MutationCtx } from '../../_generated/server';
import { v } from 'convex/values';

export const updateCheckoutSessionInvoiceArgs = {
  checkoutId: v.string(),
  xenditInvoiceId: v.string(),
  xenditInvoiceUrl: v.string(),
  xenditInvoiceExpiryDate: v.number(),
};

export const updateCheckoutSessionInvoiceHandler = async (
  ctx: MutationCtx,
  args: {
    checkoutId: string;
    xenditInvoiceId: string;
    xenditInvoiceUrl: string;
    xenditInvoiceExpiryDate: number;
  }
) => {
  const session = await ctx.db
    .query('checkoutSessions')
    .withIndex('by_checkout_id', (q) => q.eq('checkoutId', args.checkoutId))
    .first();

  if (!session) {
    throw new Error('Checkout session not found');
  }

  const now = Date.now();

  await ctx.db.patch(session._id, {
    xenditInvoiceId: args.xenditInvoiceId,
    xenditInvoiceUrl: args.xenditInvoiceUrl,
    xenditInvoiceExpiryDate: args.xenditInvoiceExpiryDate,
    xenditInvoiceCreatedAt: now,
    updatedAt: now,
  });
};
