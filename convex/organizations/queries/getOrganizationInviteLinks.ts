import { QueryCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';

// Get organization invite links
export const getOrganizationInviteLinksArgs = {
  organizationId: v.id('organizations'),
  isActive: v.optional(v.boolean()),
};

export const getOrganizationInviteLinksHandler = async (
  ctx: QueryCtx,
  args: {
    organizationId: Id<'organizations'>;
    isActive?: boolean;
  }
) => {
  const { organizationId, isActive = true } = args;

  const inviteLinks = await ctx.db
    .query('organizationInviteLinks')
    .withIndex('by_organization_active', (q) => q.eq('organizationId', organizationId).eq('isActive', isActive))
    .order('desc')
    .collect();

  return inviteLinks;
};
