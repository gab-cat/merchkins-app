import { QueryCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';

export const getCartByIdArgs = {
  cartId: v.id('carts'),
};

export const getCartByIdHandler = async (ctx: QueryCtx, args: { cartId: Id<'carts'> }) => {
  const cart = await ctx.db.get(args.cartId);
  if (!cart) throw new Error('Cart not found');
  return cart;
};
