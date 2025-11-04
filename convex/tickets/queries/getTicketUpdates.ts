import { QueryCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';
import { requireAuthentication, requireOrganizationAdminOrStaff } from '../../helpers';

export const getTicketUpdatesArgs = {
  ticketId: v.id('tickets'),
  updateType: v.optional(
    v.union(v.literal('STATUS_CHANGE'), v.literal('COMMENT'), v.literal('ASSIGNMENT'), v.literal('PRIORITY_CHANGE'), v.literal('ESCALATION'))
  ),
  includeInternal: v.optional(v.boolean()),
  limit: v.optional(v.number()),
  offset: v.optional(v.number()),
};

export const getTicketUpdatesHandler = async (
  ctx: QueryCtx,
  args: {
    ticketId: Id<'tickets'>;
    updateType?: 'STATUS_CHANGE' | 'COMMENT' | 'ASSIGNMENT' | 'PRIORITY_CHANGE' | 'ESCALATION';
    includeInternal?: boolean;
    limit?: number;
    offset?: number;
  }
) => {
  const user = await requireAuthentication(ctx);
  const ticket = await ctx.db.get(args.ticketId);
  if (!ticket) throw new Error('Ticket not found');

  const isPrivileged = user.isStaff || user.isAdmin;
  const isOwner = ticket.createdById === user._id;
  const isAssignee = ticket.assignedToId === user._id;
  if (!(isPrivileged || isOwner || isAssignee)) {
    if (ticket.organizationId) {
      try {
        await requireOrganizationAdminOrStaff(ctx, ticket.organizationId);
      } catch {
        throw new Error('Permission denied: You can only view updates for tickets you own, are assigned to, or manage for your organization');
      }
    } else {
      throw new Error('Permission denied: You can only view updates for tickets you own or are assigned to');
    }
  }

  let query;
  if (args.updateType) {
    query = ctx.db.query('ticketUpdates').withIndex('by_ticket_type', (q) => q.eq('ticketId', args.ticketId!).eq('updateType', args.updateType!));
  } else {
    query = ctx.db.query('ticketUpdates').withIndex('by_ticket', (q) => q.eq('ticketId', args.ticketId!));
  }

  const filtered = query.filter((q) => {
    const cond: any[] = [];
    if (!isPrivileged && !args.includeInternal) {
      cond.push(q.eq(q.field('isInternal'), false));
    }
    return cond.length ? q.and(...cond) : q.and();
  });

  const rows = await filtered.collect();
  rows.sort((a, b) => b.createdAt - a.createdAt);
  const total = rows.length;
  const offset = args.offset || 0;
  const limit = args.limit || 50;
  const page = rows.slice(offset, offset + limit);
  return { updates: page, total, offset, limit, hasMore: offset + limit < total };
};
