import { QueryCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';

export const getCartSummaryArgs = {
  cartId: v.id('carts'),
};

export const getCartSummaryHandler = async (ctx: QueryCtx, args: { cartId: Id<'carts'> }) => {
  const cart = await ctx.db.get(args.cartId);
  if (!cart) throw new Error('Cart not found');
  return {
    _id: cart._id,
    totalItems: cart.totalItems,
    selectedItems: cart.selectedItems,
    totalValue: cart.totalValue,
    selectedValue: cart.selectedValue,
    lastActivity: cart.lastActivity,
    isAbandoned: cart.isAbandoned,
    abandonedAt: cart.abandonedAt,
  };
};
