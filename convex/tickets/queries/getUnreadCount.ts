import { QueryCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';
import { requireAuthentication, isOrganizationMember } from '../../helpers';
import { TICKET_STATUS } from '../constants';

export const getUnreadCountArgs = {
  organizationId: v.optional(v.id('organizations')),
  forAssignee: v.optional(v.boolean()),
};

export const getUnreadCountHandler = async (ctx: QueryCtx, args: { organizationId?: Id<'organizations'>; forAssignee?: boolean }) => {
  const user = await requireAuthentication(ctx);

  let openTickets: Array<{ _id: Id<'tickets'>; updatedAt: number; createdAt: number; assignedToId?: Id<'users'> }> = [];

  if (args.organizationId) {
    const isMember = await isOrganizationMember(ctx, user._id, args.organizationId);
    if (!isMember && !(user.isAdmin || user.isStaff)) {
      throw new Error('Permission denied: not a member of this organization');
    }

    // Use compound index to efficiently query by organization and status
    // Query for OPEN status
    const open = await ctx.db
      .query('tickets')
      .withIndex('by_organization_and_status', (q) =>
        q.eq('organizationId', args.organizationId!).eq('status', TICKET_STATUS.OPEN)
      )
      .collect();

    // Query for IN_PROGRESS status
    const inProgress = await ctx.db
      .query('tickets')
      .withIndex('by_organization_and_status', (q) =>
        q.eq('organizationId', args.organizationId!).eq('status', TICKET_STATUS.IN_PROGRESS)
      )
      .collect();

    openTickets = [...open, ...inProgress];
  } else {
    // User scope: created by the user
    // Use compound index to efficiently query by creator and status
    // Query for OPEN status
    const open = await ctx.db
      .query('tickets')
      .withIndex('by_creator_and_status', (q) =>
        q.eq('createdById', user._id).eq('status', TICKET_STATUS.OPEN)
      )
      .collect();

    // Query for IN_PROGRESS status
    const inProgress = await ctx.db
      .query('tickets')
      .withIndex('by_creator_and_status', (q) =>
        q.eq('createdById', user._id).eq('status', TICKET_STATUS.IN_PROGRESS)
      )
      .collect();

    openTickets = [...open, ...inProgress];
  }

  // Unread: last update newer than user's last read time
  let count = 0;
  for (const t of openTickets) {
    const lastUpdateAt = t.updatedAt || t.createdAt;
    const read = await ctx.db
      .query('ticketReads')
      .withIndex('by_ticket_and_user', (q) => q.eq('ticketId', t._id).eq('userId', user._id))
      .unique();
    const isUnread = !read || read.lastReadAt < lastUpdateAt;
    if (!args.forAssignee) {
      if (isUnread) count++;
    } else {
      if (t.assignedToId === user._id && isUnread) count++;
    }
  }
  return { count };
};
