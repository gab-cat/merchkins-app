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

    // Count pending payout invoices for this organization
    const pendingPayouts = await ctx.db
      .query('payoutInvoices')
      .withIndex('by_organization_status', (q) => q.eq('organizationId', args.organizationId!).eq('status', 'PENDING'))
      .collect();

    return { count: pendingPayouts.length };
  } else {
    // Super admin scope: count all pending payout invoices
    if (!user.isAdmin) {
      return { count: 0 };
    }

    const pendingPayouts = await ctx.db
      .query('payoutInvoices')
      .withIndex('by_status', (q) => q.eq('status', 'PENDING'))
      .collect();

    return { count: pendingPayouts.length };
  }
};
