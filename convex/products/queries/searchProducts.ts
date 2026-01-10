import { QueryCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';

// Search products by title using full-text search
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

  const queryLower = args.query.toLowerCase().trim();
  const limit = args.limit || 50;
  const offset = args.offset || 0;
  const isDeleted = args.includeDeleted ? undefined : false;

  // When organizationId is not provided, get all public organization IDs first
  // so we can scope the search query properly
  let publicOrgIds: Set<Id<'organizations'>> | null = null;
  if (!args.organizationId) {
    const publicOrgs = await ctx.db
      .query('organizations')
      .withIndex('by_organizationType', (q) => q.eq('organizationType', 'PUBLIC'))
      .filter((q) => q.eq(q.field('isDeleted'), false))
      .collect();
    publicOrgIds = new Set(publicOrgs.map((org) => org._id));
  }

  // Use the search index for efficient database-level search
  // When organizationId is provided, it's already scoped in the search query
  // When not provided, we'll filter in-memory for public orgs after fetching
  const searchQuery = ctx.db.query('products').withSearchIndex('search_products', (q) => {
    let search = q.search('title', args.query);

    // Apply filter fields available in the search index
    if (isDeleted !== undefined) {
      search = search.eq('isDeleted', isDeleted);
    }
    if (args.organizationId) {
      // When organizationId is provided, scope at the database level
      search = search.eq('organizationId', args.organizationId);
    }
    if (args.categoryId) {
      search = search.eq('categoryId', args.categoryId);
    }

    return search;
  });

  // Fetch ALL matching products from the search query to get accurate totals
  // This ensures total and hasMore are computed from the complete filtered set
  let allProducts = await searchQuery.collect();

  // If not scoped to an organization, filter to public org products (or global)
  // This filtering happens on the complete set, ensuring accurate totals
  if (!args.organizationId && publicOrgIds) {
    const filtered: typeof allProducts = [];
    for (const p of allProducts) {
      if (!p.organizationId) {
        // Products without an organization are allowed
        filtered.push(p);
        continue;
      }
      // Only include products from public organizations
      if (publicOrgIds.has(p.organizationId)) {
        filtered.push(p);
      }
    }
    allProducts = filtered;
  }

  // Sort by relevance (exact title matches first, then partial matches)
  allProducts.sort((a, b) => {
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
  const total = allProducts.length;
  const paginatedResults = allProducts.slice(offset, offset + limit);

  return {
    products: paginatedResults,
    total,
    offset,
    limit,
    hasMore: offset + limit < total,
    query: args.query,
  };
};
