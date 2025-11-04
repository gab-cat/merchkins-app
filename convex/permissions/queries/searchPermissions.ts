import { QueryCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { requireStaffOrAdmin } from '../../helpers';

// Search permissions by name or code
export const searchPermissionsArgs = {
  searchTerm: v.string(),
  category: v.optional(
    v.union(
      v.literal('USER_MANAGEMENT'),
      v.literal('PRODUCT_MANAGEMENT'),
      v.literal('ORDER_MANAGEMENT'),
      v.literal('PAYMENT_MANAGEMENT'),
      v.literal('ORGANIZATION_MANAGEMENT'),
      v.literal('SYSTEM_ADMINISTRATION')
    )
  ),
  isActive: v.optional(v.boolean()),
  limit: v.optional(v.number()),
};

export const searchPermissionsHandler = async (
  ctx: QueryCtx,
  args: {
    searchTerm: string;
    category?:
      | 'USER_MANAGEMENT'
      | 'PRODUCT_MANAGEMENT'
      | 'ORDER_MANAGEMENT'
      | 'PAYMENT_MANAGEMENT'
      | 'ORGANIZATION_MANAGEMENT'
      | 'SYSTEM_ADMINISTRATION';
    isActive?: boolean;
    limit?: number;
  }
) => {
  // Require staff or admin to search permissions
  await requireStaffOrAdmin(ctx);

  const { searchTerm, category, isActive = true, limit = 20 } = args;

  // Get all permissions matching the criteria
  let queryBuilder;

  if (category) {
    queryBuilder = ctx.db.query('permissions').withIndex('by_category', (q) => q.eq('category', category));
  } else {
    queryBuilder = ctx.db.query('permissions').withIndex('by_active', (q) => q.eq('isActive', isActive));
  }

  const permissions = await queryBuilder
    .filter((q) => {
      let filter = q.eq(q.field('isActive'), isActive);

      if (category && isActive !== undefined) {
        filter = q.and(filter, q.eq(q.field('category'), category));
      }

      return filter;
    })
    .collect();

  // Filter by search term (case-insensitive)
  const searchTermLower = searchTerm.toLowerCase();
  const filteredPermissions = permissions.filter(
    (permission) =>
      permission.code.toLowerCase().includes(searchTermLower) ||
      permission.name.toLowerCase().includes(searchTermLower) ||
      (permission.description && permission.description.toLowerCase().includes(searchTermLower))
  );

  // Sort by relevance (exact matches first, then partial matches)
  const sortedPermissions = filteredPermissions.sort((a, b) => {
    // Exact code match gets highest priority
    if (a.code.toLowerCase() === searchTermLower) return -1;
    if (b.code.toLowerCase() === searchTermLower) return 1;

    // Exact name match gets second priority
    if (a.name.toLowerCase() === searchTermLower) return -1;
    if (b.name.toLowerCase() === searchTermLower) return 1;

    // Code starts with search term
    if (a.code.toLowerCase().startsWith(searchTermLower)) return -1;
    if (b.code.toLowerCase().startsWith(searchTermLower)) return 1;

    // Name starts with search term
    if (a.name.toLowerCase().startsWith(searchTermLower)) return -1;
    if (b.name.toLowerCase().startsWith(searchTermLower)) return 1;

    // Alphabetical order
    return a.name.localeCompare(b.name);
  });

  // Apply limit
  const limitedResults = sortedPermissions.slice(0, limit);

  return {
    permissions: limitedResults,
    totalFound: filteredPermissions.length,
    searchTerm,
    hasMore: filteredPermissions.length > limit,
  };
};
