import { QueryCtx } from '../../_generated/server';
import { Infer, v } from 'convex/values';
import { Id } from '../../_generated/dataModel';
import { requireAuthentication, isOrganizationMember } from '../../helpers';
import { TICKET_STATUS } from '../constants';

export const getOpenCountArgs = v.object({
  organizationId: v.optional(v.id('organizations')),
  forAssignee: v.optional(v.boolean()),
});

export const getOpenCountHandler = async (ctx: QueryCtx, args: Infer<typeof getOpenCountArgs>) => {
  const user = await requireAuthentication(ctx);

  let openCount = 0;

  if (args.organizationId) {
    const isMember = await isOrganizationMember(ctx, user._id, args.organizationId);
    if (!isMember && !(user.isAdmin || user.isStaff)) {
      throw new Error('Permission denied: not a member of this organization');
    }

    // Use compound index to efficiently query by organization and status
    // Query for OPEN status
    const openTickets = await ctx.db
      .query('tickets')
      .withIndex('by_organization_and_status', (q) => q.eq('organizationId', args.organizationId!).eq('status', TICKET_STATUS.OPEN))
      .collect();

    // Query for IN_PROGRESS status
    const inProgressTickets = await ctx.db
      .query('tickets')
      .withIndex('by_organization_and_status', (q) => q.eq('organizationId', args.organizationId!).eq('status', TICKET_STATUS.IN_PROGRESS))
      .collect();

    openCount = openTickets.length + inProgressTickets.length;
  } else {
    // User scope: created by the user
    // Use compound index to efficiently query by creator and status
    // Query for OPEN status
    const openTickets = await ctx.db
      .query('tickets')
      .withIndex('by_creator_and_status', (q) => q.eq('createdById', user._id).eq('status', TICKET_STATUS.OPEN))
      .collect();

    // Query for IN_PROGRESS status
    const inProgressTickets = await ctx.db
      .query('tickets')
      .withIndex('by_creator_and_status', (q) => q.eq('createdById', user._id).eq('status', TICKET_STATUS.IN_PROGRESS))
      .collect();

    openCount = openTickets.length + inProgressTickets.length;
  }

  return { count: openCount };
};
