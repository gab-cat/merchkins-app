import { MutationCtx } from "../../_generated/server";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";
import {
  requireAuthentication,
  logAction,
  sanitizeString,
  validateStringLength,
  validateUserExists,
} from "../../helpers";

export const updateTicketArgs = {
  ticketId: v.id("tickets"),
  title: v.optional(v.string()),
  description: v.optional(v.string()),
  priority: v.optional(v.union(v.literal("LOW"), v.literal("MEDIUM"), v.literal("HIGH"))),
  category: v.optional(
    v.union(
      v.literal("BUG"),
      v.literal("FEATURE_REQUEST"),
      v.literal("SUPPORT"),
      v.literal("QUESTION"),
      v.literal("OTHER")
    )
  ),
  tags: v.optional(v.array(v.string())),
  dueDate: v.optional(v.number()),
  escalated: v.optional(v.boolean()),
};

export const updateTicketHandler = async (
  ctx: MutationCtx,
  args: {
    ticketId: Id<"tickets">;
    title?: string;
    description?: string;
    priority?: "LOW" | "MEDIUM" | "HIGH";
    category?: "BUG" | "FEATURE_REQUEST" | "SUPPORT" | "QUESTION" | "OTHER";
    tags?: string[];
    dueDate?: number;
    escalated?: boolean;
  }
) => {
  const user = await requireAuthentication(ctx);
  const ticket = await ctx.db.get(args.ticketId);
  if (!ticket) throw new Error("Ticket not found");

  // Authorization: creator, assignee, or staff/admin can update
  const isPrivileged = user.isStaff || user.isAdmin;
  const isOwner = ticket.createdById === user._id;
  const isAssignee = ticket.assignedToId === user._id;
  if (!(isPrivileged || isOwner || isAssignee)) {
    throw new Error("Permission denied: You can only update tickets you own or are assigned to");
  }

  const updateData: Record<string, unknown> = { updatedAt: Date.now() };
  const now = Date.now();
  const updatesToLog: Array<{ type: string; previous?: string; next?: string; content?: string }> = [];

  if (args.title !== undefined) {
    validateStringLength(args.title, "Title", 1, 180);
    if (args.title !== ticket.title) {
      updateData.title = sanitizeString(args.title);
      updatesToLog.push({ type: "COMMENT", content: "Updated title" });
    }
  }
  if (args.description !== undefined) {
    validateStringLength(args.description, "Description", 1, 8000);
    if (args.description !== ticket.description) {
      updateData.description = sanitizeString(args.description);
      updatesToLog.push({ type: "COMMENT", content: "Updated description" });
    }
  }
  if (args.priority !== undefined && args.priority !== ticket.priority) {
    updateData.priority = args.priority;
    updatesToLog.push({ type: "PRIORITY_CHANGE", previous: ticket.priority, next: args.priority });
  }
  if (args.category !== undefined && args.category !== ticket.category) {
    updateData.category = args.category;
    updatesToLog.push({ type: "COMMENT", content: `Changed category to ${args.category}` });
  }
  if (args.tags !== undefined) {
    const tags = args.tags.slice(0, 20).map(sanitizeString);
    updateData.tags = tags;
    updatesToLog.push({ type: "COMMENT", content: "Updated tags" });
  }
  if (args.dueDate !== undefined && args.dueDate !== ticket.dueDate) {
    updateData.dueDate = args.dueDate;
    updatesToLog.push({ type: "COMMENT", content: "Updated due date" });
  }
  if (args.escalated !== undefined && args.escalated !== ticket.escalated) {
    updateData.escalated = args.escalated;
    updateData.escalatedAt = args.escalated ? now : undefined;
    updatesToLog.push({ type: "ESCALATION", previous: String(ticket.escalated), next: String(args.escalated) });
  }

  if (Object.keys(updateData).length === 1) {
    return args.ticketId; // nothing to change aside from updatedAt
  }

  await ctx.db.patch(args.ticketId, updateData);

  // Write ticketUpdates for significant changes and collect ids
  const insertedUpdateIds: Array<Id<"ticketUpdates">> = [];
  for (const change of updatesToLog) {
    const updateId = await ctx.db.insert("ticketUpdates", {
      ticketId: args.ticketId,
      update: ticket.status,
      createdById: user._id,
      creatorInfo: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        imageUrl: user.imageUrl,
      },
      ticketInfo: { title: (updateData.title as string) || ticket.title, priority: (updateData.priority as string) || ticket.priority, category: (updateData.category as string) || ticket.category },
      content: change.content || "Updated ticket",
      updateType: change.type as any,
      previousValue: change.previous,
      newValue: change.next,
      attachments: undefined,
      isInternal: false,
      createdAt: now,
      updatedAt: now,
    });
    insertedUpdateIds.push(updateId);
  }

  // Update recentUpdates and count (append one entry per inserted update)
  const appended = insertedUpdateIds.map((id) => ({
    updateId: id,
    update: ticket.status,
    content: updatesToLog.map((u) => u.content || u.type).join("; ") || "Updated ticket",
    createdById: user._id,
    creatorName: `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email,
    createdAt: now,
  }));
  const newRecent = [...ticket.recentUpdates, ...appended];
  // Keep last 5
  const trimmed = newRecent.slice(-5);
  await ctx.db.patch(args.ticketId, {
    recentUpdates: trimmed,
    updateCount: (ticket.updateCount || 0) + 1,
    updatedAt: Date.now(),
  });

  await logAction(
    ctx,
    "update_ticket",
    "DATA_CHANGE",
    "LOW",
    `Updated ticket ${args.ticketId}`,
    user._id,
    undefined,
    { changes: Object.keys(updateData) }
  );

  return args.ticketId;
};


