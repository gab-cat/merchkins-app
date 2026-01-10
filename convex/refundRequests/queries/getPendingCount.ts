import { QueryCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';
import { requireAuthentication, requireOrganizationPermission, PERMISSION_CODES } from '../../helpers';

export const getPendingCountArgs = {
  organizationId: v.optional(v.id('organizations')),
};

export const getPendingCountReturns = v.object({
  count: v.number(),
});

export const getPendingCountHandler = async (ctx: QueryCtx, args: { organizationId?: Id<'organizations'> }) => {
  const user = await requireAuthentication(ctx);

  if (args.organizationId) {
    await requireOrganizationPermission(ctx, args.organizationId, PERMISSION_CODES.MANAGE_REFUNDS, 'read');

    // Count pending refund requests for this organization
    const pendingRequests = await ctx.db
      .query('refundRequests')
      .withIndex('by_organization_status', (q) => q.eq('organizationId', args.organizationId!).eq('status', 'PENDING'))
      .filter((q) => q.eq(q.field('isDeleted'), false))
      .collect();

    return { count: pendingRequests.length };
  } else {
    // Super admin scope: count all pending refund requests
    if (!user.isAdmin) {
      return { count: 0 };
    }

    const pendingRequests = await ctx.db
      .query('refundRequests')
      .withIndex('by_status', (q) => q.eq('status', 'PENDING'))
      .filter((q) => q.eq(q.field('isDeleted'), false))
      .collect();

    return { count: pendingRequests.length };
  }
};
