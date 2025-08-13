import { QueryCtx } from "../../_generated/server";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";
import { requireAuthentication } from "../../helpers";

export const getTicketByIdArgs = {
  ticketId: v.id("tickets"),
};

export const getTicketByIdHandler = async (
  ctx: QueryCtx,
  args: { ticketId: Id<"tickets"> }
) => {
  const user = await requireAuthentication(ctx);
  const ticket = await ctx.db.get(args.ticketId);
  if (!ticket) throw new Error("Ticket not found");

  const isPrivileged = user.isStaff || user.isAdmin;
  const isOwner = ticket.createdById === user._id;
  const isAssignee = ticket.assignedToId === user._id;
  if (!(isPrivileged || isOwner || isAssignee)) {
    throw new Error("Permission denied: You can only view tickets you own or are assigned to");
  }

  return ticket;
};



