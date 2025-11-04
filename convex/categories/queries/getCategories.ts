import { QueryCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';

// Get categories with filtering and pagination
export const getCategoriesArgs = {
  organizationId: v.optional(v.id('organizations')),
  parentCategoryId: v.optional(v.id('categories')),
  level: v.optional(v.number()),
  isActive: v.optional(v.boolean()),
  isFeatured: v.optional(v.boolean()),
  includeDeleted: v.optional(v.boolean()),
  limit: v.optional(v.number()),
  offset: v.optional(v.number()),
};

export const getCategoriesHandler = async (
  ctx: QueryCtx,
  args: {
    organizationId?: Id<'organizations'>;
    parentCategoryId?: Id<'categories'>;
    level?: number;
    isActive?: boolean;
    isFeatured?: boolean;
    includeDeleted?: boolean;
    limit?: number;
    offset?: number;
  }
) => {
  let query;

  // Choose the most specific index
  if (args.organizationId && args.isActive !== undefined) {
    query = ctx.db
      .query('categories')
      .withIndex('by_organization_active', (q) => q.eq('organizationId', args.organizationId!).eq('isActive', args.isActive!));
  } else if (args.organizationId && args.level !== undefined) {
    query = ctx.db
      .query('categories')
      .withIndex('by_organization_level', (q) => q.eq('organizationId', args.organizationId!).eq('level', args.level!));
  } else if (args.organizationId) {
    query = ctx.db.query('categories').withIndex('by_organization', (q) => q.eq('organizationId', args.organizationId!));
  } else if (args.parentCategoryId !== undefined) {
    query = ctx.db.query('categories').withIndex('by_parent', (q) => q.eq('parentCategoryId', args.parentCategoryId));
  } else if (args.level !== undefined) {
    query = ctx.db.query('categories').withIndex('by_level', (q) => q.eq('level', args.level ?? 0));
  } else if (args.isActive !== undefined) {
    query = ctx.db.query('categories').withIndex('by_active', (q) => q.eq('isActive', args.isActive!));
  } else if (args.isFeatured !== undefined) {
    query = ctx.db.query('categories').withIndex('by_featured', (q) => q.eq('isFeatured', args.isFeatured!));
  } else {
    query = ctx.db.query('categories').withIndex('by_display_order');
  }

  // Apply filters
  const filteredQuery = query.filter((q) => {
    const conditions = [];

    // Deleted filter
    if (!args.includeDeleted) {
      conditions.push(q.eq(q.field('isDeleted'), false));
    }

    return conditions.length > 0 ? q.and(...conditions) : q.and();
  });

  // Get results with pagination
  const results = await filteredQuery.collect();

  // Apply manual sorting by displayOrder, then name
  results.sort((a, b) => {
    if (a.displayOrder !== b.displayOrder) {
      return a.displayOrder - b.displayOrder;
    }
    return a.name.localeCompare(b.name);
  });

  // Apply pagination
  const total = results.length;
  const offset = args.offset || 0;
  const limit = args.limit || 50;

  const paginatedResults = results.slice(offset, offset + limit);

  return {
    categories: paginatedResults,
    total,
    offset,
    limit,
    hasMore: offset + limit < total,
  };
};
