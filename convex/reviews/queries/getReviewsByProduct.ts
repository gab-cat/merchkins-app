import { QueryCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';
import { validateProductExists } from '../../helpers/validation';

export const getReviewsByProductArgs = {
  productId: v.id('products'),
  limit: v.optional(v.number()),
  cursor: v.optional(v.string()),
};

export const getReviewsByProductHandler = async (
  ctx: QueryCtx,
  args: {
    productId: Id<'products'>;
    limit?: number;
    cursor?: string;
  }
) => {
  // Validate product exists
  await validateProductExists(ctx, args.productId);

  const limit = args.limit ?? 20;

  // Use by_product index for optimal performance
  let query = ctx.db
    .query('reviews')
    .withIndex('by_product', (q) => q.eq('productId', args.productId))
    .filter((q) => q.eq(q.field('isModerated'), false)); // Only show non-moderated reviews

  // If cursor provided, filter by createdAt (for pagination)
  if (args.cursor) {
    const cursorTime = parseInt(args.cursor, 10);
    query = query.filter((q) => q.lt(q.field('createdAt'), cursorTime));
  }

  // Order by createdAt descending (most recent first) and limit
  const reviews = await query.order('desc').take(limit);

  // Get next cursor for pagination
  const nextCursor = reviews.length === limit && reviews.length > 0 ? reviews[reviews.length - 1].createdAt.toString() : undefined;

  return {
    reviews,
    nextCursor,
  };
};
