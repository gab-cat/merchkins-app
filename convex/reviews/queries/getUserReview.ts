import { QueryCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';
import { requireAuthentication } from '../../helpers/auth';
import { validateProductExists } from '../../helpers/validation';

export const getUserReviewArgs = {
  productId: v.id('products'),
};

export const getUserReviewHandler = async (
  ctx: QueryCtx,
  args: {
    productId: Id<'products'>;
  }
) => {
  const currentUser = await requireAuthentication(ctx);

  // Validate product exists
  await validateProductExists(ctx, args.productId);

  // Use compound index for optimal performance
  const review = await ctx.db
    .query('reviews')
    .withIndex('by_user_product', (q) => q.eq('userId', currentUser._id).eq('productId', args.productId))
    .first();

  return review ?? null;
};
