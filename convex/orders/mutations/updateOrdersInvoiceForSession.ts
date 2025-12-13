import { MutationCtx } from '../../_generated/server';
import { v } from 'convex/values';

export const updateOrdersInvoiceForSessionArgs = {
  checkoutId: v.string(),
  xenditInvoiceId: v.string(),
  xenditInvoiceUrl: v.string(),
  xenditInvoiceExpiryDate: v.number(),
};

export const updateOrdersInvoiceForSessionHandler = async (
  ctx: MutationCtx,
  args: {
    checkoutId: string;
    xenditInvoiceId: string;
    xenditInvoiceUrl: string;
    xenditInvoiceExpiryDate: number;
  }
) => {
  // Find all orders with this checkout ID
  const orders = await ctx.db
    .query('orders')
    .withIndex('by_checkout_id', (q) => q.eq('checkoutId', args.checkoutId))
    .filter((q) => q.eq(q.field('isDeleted'), false))
    .collect();

  const now = Date.now();

  // Update all orders with invoice details
  for (const order of orders) {
    await ctx.db.patch(order._id, {
      xenditInvoiceId: args.xenditInvoiceId,
      xenditInvoiceUrl: args.xenditInvoiceUrl,
      xenditInvoiceExpiryDate: args.xenditInvoiceExpiryDate,
      xenditInvoiceCreatedAt: now,
      updatedAt: now,
    });
  }
};
