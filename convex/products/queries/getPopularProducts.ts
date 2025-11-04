import { QueryCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';

// Get popular products based on orders, views, and ratings
export const getPopularProductsArgs = {
  organizationId: v.optional(v.id('organizations')),
  categoryId: v.optional(v.id('categories')),
  timeframe: v.optional(v.union(v.literal('day'), v.literal('week'), v.literal('month'), v.literal('all'))),
  limit: v.optional(v.number()),
  offset: v.optional(v.number()),
};

export const getPopularProductsHandler = async (
  ctx: QueryCtx,
  args: {
    organizationId?: Id<'organizations'>;
    categoryId?: Id<'categories'>;
    timeframe?: 'day' | 'week' | 'month' | 'all';
    limit?: number;
    offset?: number;
  }
) => {
  let query;

  // Choose the most specific index
  if (args.organizationId && args.categoryId) {
    query = ctx.db
      .query('products')
      .withIndex('by_organization_category', (q) => q.eq('organizationId', args.organizationId!).eq('categoryId', args.categoryId!));
  } else if (args.organizationId) {
    query = ctx.db.query('products').withIndex('by_organization', (q) => q.eq('organizationId', args.organizationId!));
  } else if (args.categoryId) {
    query = ctx.db.query('products').withIndex('by_category', (q) => q.eq('categoryId', args.categoryId!));
  } else {
    query = ctx.db.query('products').withIndex('by_isDeleted', (q) => q.eq('isDeleted', false));
  }

  // Apply basic filters
  const filteredQuery = query.filter((q) => {
    const conditions = [
      q.eq(q.field('isDeleted'), false),
      q.gt(q.field('inventory'), 0), // Only products with inventory
    ];

    // Apply timeframe filter if specified
    if (args.timeframe && args.timeframe !== 'all') {
      const now = Date.now();
      let timeThreshold: number;

      switch (args.timeframe) {
        case 'day':
          timeThreshold = now - 24 * 60 * 60 * 1000;
          break;
        case 'week':
          timeThreshold = now - 7 * 24 * 60 * 60 * 1000;
          break;
        case 'month':
          timeThreshold = now - 30 * 24 * 60 * 60 * 1000;
          break;
        default:
          timeThreshold = 0;
      }

      conditions.push(q.gte(q.field('createdAt'), timeThreshold));
    }

    return q.and(...conditions);
  });

  // Get results
  let results = await filteredQuery.collect();

  // If not scoped to an organization, only include products from public organizations (or global)
  if (!args.organizationId) {
    const filtered: any[] = [];
    for (const p of results) {
      if (!p.organizationId) {
        filtered.push(p);
        continue;
      }
      const org = await ctx.db.get(p.organizationId as Id<'organizations'>);
      if (org && !org.isDeleted && org.organizationType === 'PUBLIC') {
        filtered.push(p);
      }
    }
    results = filtered;
  }

  // Calculate popularity score for each product
  const productsWithScore = results.map((product) => {
    // Popularity score calculation:
    // - Orders: 40% weight
    // - Rating: 30% weight
    // - Views: 20% weight
    // - Reviews count: 10% weight
    const orderScore = product.totalOrders * 0.4;
    const ratingScore = (product.rating / 5) * product.reviewsCount * 0.3;
    const viewScore = (product.viewCount / 100) * 0.2; // Normalize views
    const reviewScore = product.reviewsCount * 0.1;

    const popularityScore = orderScore + ratingScore + viewScore + reviewScore;

    return {
      ...product,
      popularityScore,
    };
  });

  // Sort by popularity score
  productsWithScore.sort((a, b) => {
    if (b.popularityScore !== a.popularityScore) {
      return b.popularityScore - a.popularityScore;
    }

    // Secondary sort by rating, then orders, then views
    if (b.rating !== a.rating) return b.rating - a.rating;
    if (b.totalOrders !== a.totalOrders) return b.totalOrders - a.totalOrders;
    return b.viewCount - a.viewCount;
  });

  // Apply pagination
  const total = productsWithScore.length;
  const offset = args.offset || 0;
  const limit = args.limit || 20;

  const paginatedResults = productsWithScore.slice(offset, offset + limit);

  // Remove the popularity score from the final results
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const finalResults = paginatedResults.map(({ popularityScore, ...product }) => product);

  return {
    products: finalResults,
    total,
    offset,
    limit,
    hasMore: offset + limit < total,
  };
};
