import { MutationCtx } from "../../_generated/server";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";
import { requireAuthentication, logAction } from "../../helpers";

export const restoreTicketArgs = {
  ticketId: v.id("tickets"),
};

export const restoreTicketHandler = async (
  ctx: MutationCtx,
  args: { ticketId: Id<"tickets"> }
) => {
  const user = await requireAuthentication(ctx);
  const ticket = await ctx.db.get(args.ticketId);
  if (!ticket) throw new Error("Ticket not found");

  const isPrivileged = user.isStaff || user.isAdmin;
  const isOwner = ticket.createdById === user._id;
  const isAssignee = ticket.assignedToId === user._id;
  if (!(isPrivileged || isOwner || isAssignee)) {
    throw new Error("Permission denied: You can only restore tickets you own or are assigned to");
  }

  const filteredTags = (ticket.tags || []).filter((t) => t !== "archived");
  await ctx.db.patch(args.ticketId, { tags: filteredTags, status: ticket.status === "CLOSED" ? "OPEN" : ticket.status, updatedAt: Date.now() });

  await logAction(ctx, "restore_ticket", "DATA_CHANGE", "LOW", `Restored ticket ${args.ticketId}`, user._id, undefined, { ticketId: args.ticketId });
  return args.ticketId;
};



