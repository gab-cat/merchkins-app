import { QueryCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';

// Search products by title, description, or tags
export const searchProductsArgs = {
  query: v.string(),
  organizationId: v.optional(v.id('organizations')),
  categoryId: v.optional(v.id('categories')),
  includeDeleted: v.optional(v.boolean()),
  limit: v.optional(v.number()),
  offset: v.optional(v.number()),
};

export const searchProductsHandler = async (
  ctx: QueryCtx,
  args: {
    query: string;
    organizationId?: Id<'organizations'>;
    categoryId?: Id<'categories'>;
    includeDeleted?: boolean;
    limit?: number;
    offset?: number;
  }
) => {
  if (!args.query || args.query.trim().length === 0) {
    throw new Error('Search query cannot be empty');
  }

  const searchTerms = args.query.toLowerCase().trim().split(/\s+/);

  let baseQuery;

  // Choose the most specific index
  if (args.organizationId && args.categoryId) {
    baseQuery = ctx.db
      .query('products')
      .withIndex('by_organization_category', (q) => q.eq('organizationId', args.organizationId!).eq('categoryId', args.categoryId!));
  } else if (args.organizationId) {
    baseQuery = ctx.db.query('products').withIndex('by_organization', (q) => q.eq('organizationId', args.organizationId!));
  } else if (args.categoryId) {
    baseQuery = ctx.db.query('products').withIndex('by_category', (q) => q.eq('categoryId', args.categoryId!));
  } else {
    baseQuery = ctx.db.query('products').withIndex('by_isDeleted', (q) => q.eq('isDeleted', false));
  }

  // Apply basic filters
  let filteredQuery = baseQuery;

  if (!args.includeDeleted) {
    filteredQuery = filteredQuery.filter((q) => q.eq(q.field('isDeleted'), false));
  }

  // Get all results for text searching
  let allProducts = await filteredQuery.collect();

  // If not scoped to an organization, filter to public org products (or global)
  if (!args.organizationId) {
    const filtered: typeof allProducts = [] as any;
    for (const p of allProducts) {
      if (!p.organizationId) {
        filtered.push(p);
        continue;
      }
      const org = await ctx.db.get(p.organizationId as Id<'organizations'>);
      if (org && !org.isDeleted && org.organizationType === 'PUBLIC') {
        filtered.push(p);
      }
    }
    allProducts = filtered;
  }

  // Filter products by search terms
  const matchedProducts = allProducts.filter((product) => {
    const searchableText = [
      product.title,
      product.description || '',
      ...product.tags,
      product.creatorInfo.firstName || '',
      product.creatorInfo.lastName || '',
      product.organizationInfo?.name || '',
      product.categoryInfo?.name || '',
    ]
      .join(' ')
      .toLowerCase();

    // Check if all search terms are found in the searchable text
    return searchTerms.every((term) => searchableText.includes(term));
  });

  // Sort by relevance (exact title matches first, then partial matches)
  const queryLower = args.query.toLowerCase();
  matchedProducts.sort((a, b) => {
    const aTitle = a.title.toLowerCase();
    const bTitle = b.title.toLowerCase();

    // Exact title match comes first
    if (aTitle === queryLower && bTitle !== queryLower) return -1;
    if (bTitle === queryLower && aTitle !== queryLower) return 1;

    // Title starts with query comes next
    if (aTitle.startsWith(queryLower) && !bTitle.startsWith(queryLower)) return -1;
    if (bTitle.startsWith(queryLower) && !aTitle.startsWith(queryLower)) return 1;

    // Then by rating and reviews
    if (b.rating !== a.rating) return b.rating - a.rating;
    if (b.reviewsCount !== a.reviewsCount) return b.reviewsCount - a.reviewsCount;

    // Finally by creation date
    return b.createdAt - a.createdAt;
  });

  // Apply pagination
  const total = matchedProducts.length;
  const offset = args.offset || 0;
  const limit = args.limit || 50;

  const paginatedResults = matchedProducts.slice(offset, offset + limit);

  return {
    products: paginatedResults,
    total,
    offset,
    limit,
    hasMore: offset + limit < total,
    query: args.query,
  };
};
