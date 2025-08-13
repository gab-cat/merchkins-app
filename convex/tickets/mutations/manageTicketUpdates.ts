import { MutationCtx } from "../../_generated/server";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";
import { requireAuthentication, logAction } from "../../helpers";

export const addTicketUpdateArgs = {
  ticketId: v.id("tickets"),
  content: v.string(),
  updateType: v.union(
    v.literal("STATUS_CHANGE"),
    v.literal("COMMENT"),
    v.literal("ASSIGNMENT"),
    v.literal("PRIORITY_CHANGE"),
    v.literal("ESCALATION")
  ),
  status: v.optional(
    v.union(
      v.literal("OPEN"),
      v.literal("IN_PROGRESS"),
      v.literal("RESOLVED"),
      v.literal("CLOSED")
    )
  ),
  previousValue: v.optional(v.string()),
  newValue: v.optional(v.string()),
  isInternal: v.optional(v.boolean()),
};

export const addTicketUpdateHandler = async (
  ctx: MutationCtx,
  args: {
    ticketId: Id<"tickets">;
    content: string;
    updateType: "STATUS_CHANGE" | "COMMENT" | "ASSIGNMENT" | "PRIORITY_CHANGE" | "ESCALATION";
    status?: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
    previousValue?: string;
    newValue?: string;
    isInternal?: boolean;
  }
) => {
  const user = await requireAuthentication(ctx);
  const ticket = await ctx.db.get(args.ticketId);
  if (!ticket) throw new Error("Ticket not found");

  const isPrivileged = user.isStaff || user.isAdmin;
  const isOwner = ticket.createdById === user._id;
  const isAssignee = ticket.assignedToId === user._id;
  if (!(isPrivileged || isOwner || isAssignee)) {
    throw new Error("Permission denied: You can only update tickets you own or are assigned to");
  }

  const now = Date.now();
  const creatorInfo = {
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    imageUrl: user.imageUrl,
  };

  const updateId = await ctx.db.insert("ticketUpdates", {
    ticketId: args.ticketId,
    update: (args.status || ticket.status),
    createdById: user._id,
    creatorInfo,
    ticketInfo: { title: ticket.title, priority: ticket.priority, category: ticket.category },
    content: args.content,
    updateType: args.updateType,
    previousValue: args.previousValue,
    newValue: args.newValue,
    attachments: undefined,
    isInternal: !!args.isInternal,
    createdAt: now,
    updatedAt: now,
  });

  // Optionally move ticket status
  let status = ticket.status;
  if (args.status && args.status !== ticket.status) {
    status = args.status;
    await ctx.db.patch(args.ticketId, { status, updatedAt: now });
  }

  const recent = [
    ...ticket.recentUpdates,
    {
      updateId,
      update: status,
      content: args.content,
      createdById: user._id,
      creatorName: `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email,
      createdAt: now,
    },
  ].slice(-5);

  await ctx.db.patch(args.ticketId, {
    recentUpdates: recent,
    updateCount: (ticket.updateCount || 0) + 1,
    responseTime: ticket.responseTime ?? (isOwner ? undefined : now - ticket.createdAt),
    resolutionTime: status === "RESOLVED" || status === "CLOSED" ? now - ticket.createdAt : ticket.resolutionTime,
    updatedAt: Date.now(),
  });

  await logAction(
    ctx,
    "add_ticket_update",
    "DATA_CHANGE",
    "LOW",
    `Added update to ticket ${args.ticketId}`,
    user._id,
    undefined,
    { updateType: args.updateType, status }
  );

  return updateId;
};



