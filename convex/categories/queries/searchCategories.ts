import { QueryCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';

// Search categories by name using full-text search
export const searchCategoriesArgs = {
  searchTerm: v.string(),
  organizationId: v.optional(v.id('organizations')),
  isActive: v.optional(v.boolean()),
  limit: v.optional(v.number()),
};

export const searchCategoriesHandler = async (
  ctx: QueryCtx,
  args: {
    searchTerm: string;
    organizationId?: Id<'organizations'>;
    isActive?: boolean;
    limit?: number;
  }
) => {
  const searchTerm = args.searchTerm.trim();
  if (!searchTerm) {
    return [];
  }

  const limit = args.limit || 20;
  const searchLower = searchTerm.toLowerCase();

  // Use the search index for efficient database-level search
  const categories = await ctx.db
    .query('categories')
    .withSearchIndex('search_categories', (q) => {
      let search = q.search('name', searchTerm).eq('isDeleted', false);

      if (args.organizationId) {
        search = search.eq('organizationId', args.organizationId);
      }
      if (args.isActive !== undefined) {
        search = search.eq('isActive', args.isActive);
      }

      return search;
    })
    .take(limit * 2); // Fetch more for re-sorting

  // Sort by relevance (exact name match first, then partial matches)
  const sorted = [...categories].sort((a, b) => {
    const aNameLower = a.name.toLowerCase();
    const bNameLower = b.name.toLowerCase();

    const aNameExact = aNameLower === searchLower;
    const bNameExact = bNameLower === searchLower;

    if (aNameExact && !bNameExact) return -1;
    if (!aNameExact && bNameExact) return 1;

    const aNameStartsWith = aNameLower.startsWith(searchLower);
    const bNameStartsWith = bNameLower.startsWith(searchLower);

    if (aNameStartsWith && !bNameStartsWith) return -1;
    if (!aNameStartsWith && bNameStartsWith) return 1;

    // Default sort by name
    return a.name.localeCompare(b.name);
  });

  return sorted.slice(0, limit);
};
