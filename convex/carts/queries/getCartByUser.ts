import { QueryCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';
import { getOptionalCurrentUser, validateUserExists } from '../../helpers';

export const getCartByUserArgs = {
  userId: v.optional(v.id('users')),
};

export const getCartByUserHandler = async (ctx: QueryCtx, args: { userId?: Id<'users'> }) => {
  let userId = args.userId;
  if (!userId) {
    const me = await getOptionalCurrentUser(ctx);
    if (!me) return null;
    userId = me._id as Id<'users'>;
  }

  const user = await validateUserExists(ctx, userId);

  if (user.cartId) {
    const cart = await ctx.db.get(user.cartId);
    if (cart) return cart;
  }

  const existingByIndex = await ctx.db
    .query('carts')
    .withIndex('by_user', (q) => q.eq('userId', user._id))
    .first();
  return existingByIndex ?? null;
};
