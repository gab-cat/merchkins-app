import { QueryCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { requireStaffOrAdmin } from '../../helpers';

// Get all permissions with optional filtering
export const getPermissionsArgs = {
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
  isSystemPermission: v.optional(v.boolean()),
  requiredRole: v.optional(v.union(v.literal('ADMIN'), v.literal('STAFF'), v.literal('MEMBER'))),
  limit: v.optional(v.number()),
  cursor: v.optional(v.string()),
};

export const getPermissionsHandler = async (
  ctx: QueryCtx,
  args: {
    category?:
      | 'USER_MANAGEMENT'
      | 'PRODUCT_MANAGEMENT'
      | 'ORDER_MANAGEMENT'
      | 'PAYMENT_MANAGEMENT'
      | 'ORGANIZATION_MANAGEMENT'
      | 'SYSTEM_ADMINISTRATION';
    isActive?: boolean;
    isSystemPermission?: boolean;
    requiredRole?: 'ADMIN' | 'STAFF' | 'MEMBER';
    limit?: number;
    cursor?: string;
  }
) => {
  // Require staff or admin to view permissions
  await requireStaffOrAdmin(ctx);

  const { category, isActive = true, isSystemPermission, requiredRole, limit = 50, cursor } = args;

  let queryBuilder;

  // Apply primary index filter
  if (category) {
    queryBuilder = ctx.db.query('permissions').withIndex('by_category', (q) => q.eq('category', category));
  } else if (isSystemPermission !== undefined) {
    queryBuilder = ctx.db.query('permissions').withIndex('by_system', (q) => q.eq('isSystemPermission', isSystemPermission));
  } else if (requiredRole !== undefined) {
    queryBuilder = ctx.db.query('permissions').withIndex('by_required_role', (q) => q.eq('requiredRole', requiredRole));
  } else {
    queryBuilder = ctx.db.query('permissions').withIndex('by_active', (q) => q.eq('isActive', isActive));
  }

  // Apply additional filters
  queryBuilder = queryBuilder.filter((q) => {
    let filter = q.eq(q.field('isActive'), isActive);

    if (isSystemPermission !== undefined && !category) {
      filter = q.and(filter, q.eq(q.field('isSystemPermission'), isSystemPermission));
    }

    if (requiredRole !== undefined && !category && isSystemPermission === undefined) {
      filter = q.and(filter, q.eq(q.field('requiredRole'), requiredRole));
    }

    return filter;
  });

  // Apply pagination and ordering
  const results = await queryBuilder.order('desc').paginate({
    numItems: limit,
    cursor: cursor || null,
  });

  return results;
};
