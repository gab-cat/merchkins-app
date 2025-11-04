import { QueryCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';

// Get product by slug
export const getProductBySlugArgs = {
  slug: v.string(),
  organizationId: v.optional(v.id('organizations')),
  includeDeleted: v.optional(v.boolean()),
};

export const getProductBySlugHandler = async (
  ctx: QueryCtx,
  args: {
    slug: string;
    organizationId?: Id<'organizations'>;
    includeDeleted?: boolean;
  }
) => {
  let query;

  if (args.organizationId) {
    // Search within organization
    query = ctx.db
      .query('products')
      .withIndex('by_organization', (q) => q.eq('organizationId', args.organizationId!))
      .filter((q) => q.eq(q.field('slug'), args.slug));
  } else {
    // Search globally by slug
    query = ctx.db.query('products').withIndex('by_slug', (q) => q.eq('slug', args.slug));
  }

  if (!args.includeDeleted) {
    query = query.filter((q) => q.eq(q.field('isDeleted'), false));
  }

  const product = await query.first();

  if (!product) {
    throw new Error('Product not found');
  }
  // If product belongs to an organization and this is a global lookup (no organizationId provided),
  // hide details for non-public org products
  if (product.organizationId && !args.organizationId) {
    const org = await ctx.db.get(product.organizationId);
    if (org && !org.isDeleted && org.organizationType !== 'PUBLIC') {
      // Hide details for non-public org products in global context
      throw new Error('Product not found');
    }
  }

  return product;
};
