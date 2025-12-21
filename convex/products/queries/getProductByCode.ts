import { v } from 'convex/values';
import { QueryCtx } from '../../_generated/server';

/**
 * Get a product by its unique code.
 * Returns null if no product found with the given code.
 */
export const getProductByCodeArgs = {
  code: v.string(),
};

export const getProductByCodeHandler = async (ctx: QueryCtx, args: { code: string }) => {
  const product = await ctx.db
    .query('products')
    .withIndex('by_code', (q) => q.eq('code', args.code))
    .filter((q) => q.eq(q.field('isDeleted'), false))
    .first();

  if (!product) {
    return null;
  }

  return {
    _id: product._id,
    title: product.title,
    slug: product.slug,
    code: product.code,
    organizationInfo: product.organizationInfo,
    minPrice: product.minPrice,
    maxPrice: product.maxPrice,
    imageUrl: product.imageUrl,
  };
};
