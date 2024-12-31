import { v } from 'convex/values';
import { MutationCtx } from '../../_generated/server';
import { Id } from '../../_generated/dataModel';

export const createPaymongoCheckoutForOrderArgs = {
  orderId: v.id('orders'),
  paymongoCheckoutId: v.string(),
  paymongoCheckoutUrl: v.string(),
  paymongoCheckoutExpiryDate: v.number(),
};

export const createPaymongoCheckoutForOrderReturns = v.object({
  success: v.boolean(),
  orderId: v.id('orders'),
  checkoutUrl: v.string(),
});

export const createPaymongoCheckoutForOrderHandler = async (
  ctx: MutationCtx,
  args: {
    orderId: Id<'orders'>;
    paymongoCheckoutId: string;
    paymongoCheckoutUrl: string;
    paymongoCheckoutExpiryDate: number;
  }
) => {
  // Verify order exists
  const order = await ctx.db.get(args.orderId);
  if (!order || order.isDeleted) {
    throw new Error('Order not found');
  }

  // Update order with Paymongo checkout details
  await ctx.db.patch(args.orderId, {
    paymongoCheckoutId: args.paymongoCheckoutId,
    paymongoCheckoutUrl: args.paymongoCheckoutUrl,
    paymongoCheckoutExpiryDate: args.paymongoCheckoutExpiryDate,
    paymongoCheckoutCreatedAt: Date.now(),
    updatedAt: Date.now(),
  });

  return {
    success: true,
    orderId: args.orderId,
    checkoutUrl: args.paymongoCheckoutUrl,
  };
};
