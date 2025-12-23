import { QueryCtx } from '../../_generated/server';
import { Id } from '../../_generated/dataModel';

export const getAllActiveProductsArgs = {};

export const getAllActiveProductsHandler = async (ctx: QueryCtx) => {
  // Get all non-deleted, active products
  const products = await ctx.db
    .query('products')
    .withIndex('by_isDeleted', (q) => q.eq('isDeleted', false))
    .filter((q) => q.eq(q.field('isActive'), true))
    .collect();

  // Filter to only include products from public organizations
  const publicProducts = [];
  for (const product of products) {
    if (!product.organizationId) {
      publicProducts.push(product);
      continue;
    }
    const org = await ctx.db.get(product.organizationId as Id<'organizations'>);
    if (org && !org.isDeleted && org.organizationType === 'PUBLIC') {
      publicProducts.push(product);
    }
  }

  return publicProducts;
};
