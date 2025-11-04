import { QueryCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';
import { requireAuthentication, isOrganizationMember } from '../../helpers';

export const getUnreadCountArgs = {
  organizationId: v.optional(v.id('organizations')),
  forAssignee: v.optional(v.boolean()),
};

export const getUnreadCountHandler = async (ctx: QueryCtx, args: { organizationId?: Id<'organizations'>; forAssignee?: boolean }) => {
  const user = await requireAuthentication(ctx);

  let query;
  if (args.organizationId) {
    const isMember = await isOrganizationMember(ctx, user._id, args.organizationId);
    if (!isMember && !(user.isAdmin || user.isStaff)) {
      throw new Error('Permission denied: not a member of this organization');
    }
    query = ctx.db.query('tickets').withIndex('by_organization', (q) => q.eq('organizationId', args.organizationId!));
  } else {
    // User scope: created by the user
    query = ctx.db.query('tickets').withIndex('by_creator', (q) => q.eq('createdById', user._id));
  }

  const all = await query.collect();
  const open = all.filter((t) => t.status === 'OPEN' || t.status === 'IN_PROGRESS');

  // Unread: last update newer than user's last read time
  let count = 0;
  for (const t of open) {
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
