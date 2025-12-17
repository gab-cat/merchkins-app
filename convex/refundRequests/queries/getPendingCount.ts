import { QueryCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';
import { requireAuthentication, isOrganizationMember } from '../../helpers';

export const getPendingCountArgs = {
  organizationId: v.optional(v.id('organizations')),
};

export const getPendingCountReturns = v.object({
  count: v.number(),
});

export const getPendingCountHandler = async (ctx: QueryCtx, args: { organizationId?: Id<'organizations'> }) => {
  const user = await requireAuthentication(ctx);

  if (args.organizationId) {
    // Check if user is a member of the organization
    const isMember = await isOrganizationMember(ctx, user._id, args.organizationId);
    if (!isMember && !(user.isAdmin || user.isStaff)) {
      throw new Error('Permission denied: not a member of this organization');
    }

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
