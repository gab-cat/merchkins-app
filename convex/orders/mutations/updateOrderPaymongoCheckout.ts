import { v } from 'convex/values';
import { MutationCtx } from '../../_generated/server';
import { Id } from '../../_generated/dataModel';

export const updateOrderPaymongoCheckoutArgs = {
  orderId: v.id('orders'),
  paymongoCheckoutId: v.string(),
  paymongoCheckoutUrl: v.string(),
  paymongoCheckoutExpiryDate: v.number(),
};

export const updateOrderPaymongoCheckoutHandler = async (
  ctx: MutationCtx,
  args: {
    orderId: Id<'orders'>;
    paymongoCheckoutId: string;
    paymongoCheckoutUrl: string;
    paymongoCheckoutExpiryDate: number;
  }
) => {
  await ctx.db.patch(args.orderId, {
    paymongoCheckoutId: args.paymongoCheckoutId,
    paymongoCheckoutUrl: args.paymongoCheckoutUrl,
    paymongoCheckoutExpiryDate: args.paymongoCheckoutExpiryDate,
    paymongoCheckoutCreatedAt: Date.now(),
    updatedAt: Date.now(),
  });
};
