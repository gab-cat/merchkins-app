import { MutationCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';
import { requireAuthentication, logAction, validateUserExists, requireOrganizationAdminOrStaff } from '../../helpers';

export const assignTicketArgs = {
  ticketId: v.id('tickets'),
  assigneeId: v.id('users'),
};

export const assignTicketHandler = async (ctx: MutationCtx, args: { ticketId: Id<'tickets'>; assigneeId: Id<'users'> }) => {
  const user = await requireAuthentication(ctx);
  const ticket = await ctx.db.get(args.ticketId);
  if (!ticket) throw new Error('Ticket not found');

  // Only staff/admin or current assignee or creator can reassign
  const isPrivileged = user.isStaff || user.isAdmin;
  const isOwner = ticket.createdById === user._id;
  const isAssignee = ticket.assignedToId === user._id;
  if (!(isPrivileged || isOwner || isAssignee)) {
    if (ticket.organizationId) {
      try {
        await requireOrganizationAdminOrStaff(ctx, ticket.organizationId);
      } catch {
        throw new Error('Permission denied: Only organization admins or staff can reassign tickets for this organization');
      }
    } else {
      throw new Error('Permission denied: You cannot reassign this ticket');
    }
  }

  const assignee = await validateUserExists(ctx, args.assigneeId);
  const assigneeInfo = {
    firstName: assignee.firstName,
    lastName: assignee.lastName,
    email: assignee.email,
    imageUrl: assignee.imageUrl,
  };

  const now = Date.now();
  await ctx.db.patch(args.ticketId, { assignedToId: args.assigneeId, assigneeInfo, updatedAt: now });

  const updateId = await ctx.db.insert('ticketUpdates', {
    ticketId: args.ticketId,
    update: ticket.status,
    createdById: user._id,
    creatorInfo: {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      imageUrl: user.imageUrl,
    },
    ticketInfo: { title: ticket.title, priority: ticket.priority, category: ticket.category },
    content: `Assigned to ${assignee.firstName || assignee.lastName ? `${assignee.firstName || ''} ${assignee.lastName || ''}`.trim() : assignee.email}`,
    updateType: 'ASSIGNMENT',
    previousValue: ticket.assigneeInfo
      ? `${ticket.assigneeInfo.firstName || ''} ${ticket.assigneeInfo.lastName || ''}`.trim() || ticket.assigneeInfo.email
      : undefined,
    newValue: assignee.email,
    attachments: undefined,
    isInternal: true,
    createdAt: now,
    updatedAt: now,
  });

  const recent = [
    ...ticket.recentUpdates,
    {
      updateId,
      update: ticket.status,
      content: `Assigned to ${assignee.firstName || assignee.lastName ? `${assignee.firstName || ''} ${assignee.lastName || ''}`.trim() : assignee.email}`,
      createdById: user._id,
      creatorName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
      createdAt: now,
    },
  ].slice(-5);

  await ctx.db.patch(args.ticketId, { recentUpdates: recent, updateCount: (ticket.updateCount || 0) + 1, updatedAt: Date.now() });

  await logAction(ctx, 'assign_ticket', 'DATA_CHANGE', 'LOW', `Assigned ticket ${args.ticketId} to ${assignee.email}`, user._id, undefined, {
    ticketId: args.ticketId,
    assigneeId: args.assigneeId,
  });

  return args.ticketId;
};
