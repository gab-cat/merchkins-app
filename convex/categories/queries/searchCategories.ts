import { QueryCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';

// Search categories by name, description, or tags
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
  const searchTerm = args.searchTerm.toLowerCase().trim();
  if (!searchTerm) {
    return [];
  }

  let query;

  if (args.organizationId) {
    query = ctx.db.query('categories').withIndex('by_organization', (q) => q.eq('organizationId', args.organizationId!));
  } else {
    query = ctx.db.query('categories');
  }

  const categories = await query
    .filter((q) => {
      const conditions = [q.eq(q.field('isDeleted'), false)];

      if (args.isActive !== undefined) {
        conditions.push(q.eq(q.field('isActive'), args.isActive));
      }

      return q.and(...conditions);
    })
    .collect();

  // Filter by search term in memory (since Convex doesn't support text search in filters)
  const filteredCategories = categories.filter((category) => {
    const nameMatch = category.name.toLowerCase().includes(searchTerm);
    const descriptionMatch = category.description?.toLowerCase().includes(searchTerm) || false;
    const tagMatch = category.tags.some((tag) => tag.toLowerCase().includes(searchTerm));

    return nameMatch || descriptionMatch || tagMatch;
  });

  // Sort by relevance (exact name match first, then partial matches)
  filteredCategories.sort((a, b) => {
    const aNameExact = a.name.toLowerCase() === searchTerm;
    const bNameExact = b.name.toLowerCase() === searchTerm;

    if (aNameExact && !bNameExact) return -1;
    if (!aNameExact && bNameExact) return 1;

    const aNameStartsWith = a.name.toLowerCase().startsWith(searchTerm);
    const bNameStartsWith = b.name.toLowerCase().startsWith(searchTerm);

    if (aNameStartsWith && !bNameStartsWith) return -1;
    if (!aNameStartsWith && bNameStartsWith) return 1;

    // Default sort by name
    return a.name.localeCompare(b.name);
  });

  // Apply limit
  const limit = args.limit || 20;
  return filteredCategories.slice(0, limit);
};
