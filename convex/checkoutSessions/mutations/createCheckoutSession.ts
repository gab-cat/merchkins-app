import { MutationCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';

export const createCheckoutSessionArgs = {
  checkoutId: v.string(),
  customerId: v.id('users'),
  orderIds: v.array(v.id('orders')),
  totalAmount: v.number(),
};

export const createCheckoutSessionHandler = async (
  ctx: MutationCtx,
  args: {
    checkoutId: string;
    customerId: Id<'users'>;
    orderIds: Array<Id<'orders'>>;
    totalAmount: number;
  }
) => {
  const now = Date.now();

  await ctx.db.insert('checkoutSessions', {
    checkoutId: args.checkoutId,
    customerId: args.customerId,
    orderIds: args.orderIds,
    totalAmount: args.totalAmount,
    status: 'PENDING',
    createdAt: now,
    updatedAt: now,
  });

  return { checkoutId: args.checkoutId };
};
