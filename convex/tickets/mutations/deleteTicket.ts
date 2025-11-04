import { MutationCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';
import { requireAuthentication, logAction } from '../../helpers';

export const deleteTicketArgs = {
  ticketId: v.id('tickets'),
  force: v.optional(v.boolean()),
};

export const deleteTicketHandler = async (ctx: MutationCtx, args: { ticketId: Id<'tickets'>; force?: boolean }) => {
  const user = await requireAuthentication(ctx);
  const ticket = await ctx.db.get(args.ticketId);
  if (!ticket) throw new Error('Ticket not found');

  const isPrivileged = user.isStaff || user.isAdmin;
  const isOwner = ticket.createdById === user._id;
  const isAssignee = ticket.assignedToId === user._id;
  if (!(isPrivileged || isOwner || isAssignee)) {
    throw new Error('Permission denied: You can only delete tickets you own or are assigned to');
  }

  if (args.force && user.isAdmin) {
    await ctx.db.delete(args.ticketId);
    await logAction(ctx, 'hard_delete_ticket', 'DATA_CHANGE', 'HIGH', `Hard deleted ticket ${args.ticketId}`, user._id, undefined, {
      ticketId: args.ticketId,
    });
  } else {
    // Soft delete via status CLOSED and tag
    const now = Date.now();
    await ctx.db.patch(args.ticketId, { status: 'CLOSED', tags: [...ticket.tags, 'archived'], updatedAt: now });
    await logAction(ctx, 'archive_ticket', 'DATA_CHANGE', 'LOW', `Archived ticket ${args.ticketId}`, user._id, undefined, {
      ticketId: args.ticketId,
    });
  }

  return { success: true };
};
