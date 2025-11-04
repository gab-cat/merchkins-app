import { MutationCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';
import { requireAuthentication, logAction } from '../../helpers';

export const createOrGetCartArgs = {
  userId: v.optional(v.id('users')),
};

export const createOrGetCartHandler = async (ctx: MutationCtx, args: { userId?: Id<'users'> }) => {
  const currentUser = await requireAuthentication(ctx);

  const targetUserId = args.userId ?? currentUser._id;
  const user = await ctx.db.get(targetUserId);
  if (!user || user.isDeleted) {
    throw new Error('User not found or inactive');
  }

  // Try fast path by reference on user
  if (user.cartId) {
    const existing = await ctx.db.get(user.cartId);
    if (existing) {
      return existing._id;
    }
  }

  // Search by index in case user.cartId wasn't set previously
  const existingByIndex = await ctx.db
    .query('carts')
    .withIndex('by_user', (q) => q.eq('userId', targetUserId))
    .first();

  if (existingByIndex) {
    // Backfill user.cartId if missing
    if (!user.cartId) {
      await ctx.db.patch(user._id, { cartId: existingByIndex._id, updatedAt: Date.now() });
    }
    return existingByIndex._id;
  }

  const now = Date.now();
  const cartId = await ctx.db.insert('carts', {
    userId: targetUserId,
    userInfo: {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      imageUrl: user.imageUrl,
    },
    embeddedItems: [],
    totalItems: 0,
    selectedItems: 0,
    totalValue: 0,
    selectedValue: 0,
    lastActivity: now,
    isAbandoned: false,
    abandonedAt: undefined,
    createdAt: now,
    updatedAt: now,
  });

  await ctx.db.patch(user._id, { cartId, updatedAt: now });

  await logAction(ctx, 'create_or_get_cart', 'DATA_CHANGE', 'LOW', `Initialized cart for user ${user.email}`, currentUser._id, undefined, {
    userId: user._id,
    cartId,
  });

  return cartId;
};
