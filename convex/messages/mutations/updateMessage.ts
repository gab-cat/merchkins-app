import { MutationCtx } from "../../_generated/server";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";
import {
  requireAuthentication,
  requireOrganizationPermission,
  logAction,
  sanitizeString,
  validateStringLength,
} from "../../helpers";

export const updateMessageArgs = {
  messageId: v.id("messages"),
  subject: v.optional(v.string()),
  message: v.optional(v.string()),
  priority: v.optional(v.union(
    v.literal("LOW"),
    v.literal("NORMAL"),
    v.literal("HIGH"),
    v.literal("URGENT")
  )),
  tags: v.optional(v.array(v.string())),
  assignedTo: v.optional(v.id("users")),
  isArchived: v.optional(v.boolean()),
  isResolved: v.optional(v.boolean()),
};

export const updateMessageHandler = async (
  ctx: MutationCtx,
  args: {
    messageId: Id<"messages">;
    subject?: string;
    message?: string;
    priority?: "LOW" | "NORMAL" | "HIGH" | "URGENT";
    tags?: string[];
    assignedTo?: Id<"users">;
    isArchived?: boolean;
    isResolved?: boolean;
  }
) => {
  const currentUser = await requireAuthentication(ctx);
  const existing = await ctx.db.get(args.messageId);
  if (!existing) {
    throw new Error("Message not found");
  }

  if (existing.organizationId) {
    await requireOrganizationPermission(ctx, existing.organizationId, "MANAGE_TICKETS", "update");
  } else if (!(currentUser.isAdmin || existing.sentBy === currentUser._id)) {
    throw new Error("Permission denied: You can only update your own messages");
  }

  const updateData: Record<string, unknown> = { updatedAt: Date.now() };

  if (args.subject !== undefined) {
    validateStringLength(args.subject, "Subject", 1, 200);
    updateData.subject = sanitizeString(args.subject);
  }
  if (args.message !== undefined) {
    validateStringLength(args.message, "Message", 1, 5000);
    updateData.message = sanitizeString(args.message);
  }
  if (args.priority !== undefined) updateData.priority = args.priority;
  if (args.tags !== undefined) updateData.tags = args.tags;
  if (args.assignedTo !== undefined) updateData.assignedTo = args.assignedTo;
  if (args.isArchived !== undefined) updateData.isArchived = args.isArchived;
  if (args.isResolved !== undefined) updateData.isResolved = args.isResolved;

  await ctx.db.patch(args.messageId, updateData);

  await logAction(
    ctx,
    "update_message",
    "DATA_CHANGE",
    "LOW",
    `Updated message ${args.messageId}`,
    currentUser._id,
    existing.organizationId,
    { changes: Object.keys(updateData) }
  );

  return args.messageId;
};


