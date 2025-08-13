import { MutationCtx } from "../../_generated/server";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";
import {
  requireAuthentication,
  requireOrganizationPermission,
  logAction,
  sanitizeString,
  validateNotEmpty,
  validateStringLength,
  validateOrganizationExists,
} from "../../helpers";

export const replyToMessageArgs = {
  parentMessageId: v.id("messages"),
  message: v.string(),
  attachments: v.optional(
    v.array(
      v.object({
        filename: v.string(),
        url: v.string(),
        size: v.number(),
        mimeType: v.string(),
      })
    )
  ),
  assignedTo: v.optional(v.id("users")),
  isInternalNote: v.optional(v.boolean()),
};

export const replyToMessageHandler = async (
  ctx: MutationCtx,
  args: {
    parentMessageId: Id<"messages">;
    message: string;
    attachments?: Array<{ filename: string; url: string; size: number; mimeType: string }>;
    assignedTo?: Id<"users">;
    isInternalNote?: boolean;
  }
) => {
  // Require authentication for staff/admin replies
  const currentUser = await requireAuthentication(ctx);

  // Load parent
  const parent = await ctx.db.get(args.parentMessageId);
  if (!parent) {
    throw new Error("Parent message not found");
  }

  // If message belongs to organization, require permission
  if (parent.organizationId) {
    await requireOrganizationPermission(ctx, parent.organizationId, "MANAGE_TICKETS", "update");
    await validateOrganizationExists(ctx, parent.organizationId);
  }

  // Validate inputs
  validateNotEmpty(args.message, "Message");
  validateStringLength(args.message, "Message", 1, 5000);

  const text = sanitizeString(args.message);
  const attachments = (args.attachments || []).slice(0, 10);

  const now = Date.now();

  // Build replyToInfo for context
  const replyToInfo = {
    subject: parent.subject,
    message: parent.message,
    senderName: `${parent.senderInfo?.firstName || ""} ${parent.senderInfo?.lastName || ""}`.trim() || parent.senderInfo?.email || "Unknown",
    sentAt: parent.createdAt,
  };

  // Reply message
  const messageId = await ctx.db.insert("messages", {
    organizationId: parent.organizationId,
    isArchived: false,
    isRead: true,
    isResolved: parent.isResolved,
    isSentByCustomer: false,
    isSentByAdmin: currentUser.isStaff || currentUser.isAdmin,
    repliesToId: parent._id,
    sentBy: currentUser._id,
    senderInfo: {
      firstName: currentUser.firstName,
      lastName: currentUser.lastName,
      email: currentUser.email,
      imageUrl: currentUser.imageUrl,
      isStaff: currentUser.isStaff || false,
      isAdmin: currentUser.isAdmin || false,
    },
    organizationInfo: parent.organizationInfo,
    replyToInfo,
    email: parent.email,
    subject: parent.subject,
    message: text,
    messageType: "REPLY" as const,
    priority: parent.priority,
    conversationId: parent.conversationId || (parent._id as unknown as string),
    threadDepth: (parent.threadDepth || 0) + 1,
    attachments,
    responseTime: parent.responseTime ?? (parent.isSentByCustomer ? now - parent.createdAt : undefined),
    assignedTo: args.assignedTo ?? parent.assignedTo,
    assigneeInfo: parent.assigneeInfo,
    tags: parent.tags,
    sentimentScore: undefined,
    urgencyScore: undefined,
    createdAt: now,
    updatedAt: now,
  });

  // Mark parent as read
  await ctx.db.patch(parent._id, { isRead: true, updatedAt: Date.now() });

  await logAction(
    ctx,
    "reply_message",
    "DATA_CHANGE",
    "LOW",
    `Replied to message ${parent._id}`,
    currentUser._id,
    parent.organizationId,
    { parentMessageId: parent._id, messageId }
  );

  return messageId;
};


