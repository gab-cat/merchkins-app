import { MutationCtx } from "../../_generated/server";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";
import { requireAuthentication, sanitizeString, logAction } from "../../helpers";

export const editMessageArgs = {
  messageId: v.id("chatMessages"),
  content: v.string(),
};

export const deleteMessageArgs = {
  messageId: v.id("chatMessages"),
};

export const togglePinMessageArgs = {
  messageId: v.id("chatMessages"),
  isPinned: v.boolean(),
};

export const reactToMessageArgs = {
  messageId: v.id("chatMessages"),
  emoji: v.string(),
};

export const markRoomReadArgs = {
  chatRoomId: v.id("chatRooms"),
};

export const editMessageHandler = async (
  ctx: MutationCtx,
  args: { messageId: Id<"chatMessages">; content: string }
) => {
  const currentUser = await requireAuthentication(ctx);
  const now = Date.now();

  const message = await ctx.db.get(args.messageId);
  if (!message || message.isDeleted) {
    throw new Error("Message not found or deleted");
  }

  if (message.senderId !== currentUser._id) {
    throw new Error("Only the sender can edit the message");
  }

  const content = sanitizeString(args.content);
  if (content.length === 0) {
    throw new Error("Message cannot be empty");
  }

  const editHistory = [
    ...(message.editHistory || []),
    { content: message.content, editedAt: now },
  ];

  await ctx.db.patch(args.messageId, {
    content,
    isEdited: true,
    editHistory,
    updatedAt: now,
  });

  await logAction(
    ctx,
    "edit_chat_message",
    "DATA_CHANGE",
    "LOW",
    `Edited message ${args.messageId}`,
    currentUser._id,
    undefined,
    { messageId: args.messageId }
  );

  return true;
};

export const deleteMessageHandler = async (
  ctx: MutationCtx,
  args: { messageId: Id<"chatMessages"> }
) => {
  const currentUser = await requireAuthentication(ctx);

  const message = await ctx.db.get(args.messageId);
  if (!message || message.isDeleted) {
    throw new Error("Message not found or already deleted");
  }

  if (message.senderId !== currentUser._id) {
    throw new Error("Only the sender can delete the message");
  }

  await ctx.db.patch(args.messageId, { isDeleted: true, content: "", updatedAt: Date.now() });

  await logAction(
    ctx,
    "delete_chat_message",
    "DATA_CHANGE",
    "LOW",
    `Deleted message ${args.messageId}`,
    currentUser._id,
    undefined,
    { messageId: args.messageId }
  );

  return true;
};

export const togglePinMessageHandler = async (
  ctx: MutationCtx,
  args: { messageId: Id<"chatMessages">; isPinned: boolean }
) => {
  const currentUser = await requireAuthentication(ctx);

  const message = await ctx.db.get(args.messageId);
  if (!message || message.isDeleted) {
    throw new Error("Message not found or deleted");
  }

  // Require moderator or admin in room
  const room = await ctx.db.get(message.chatRoomId);
  if (!room || !room.isActive) {
    throw new Error("Chat room not found or inactive");
  }
  const embeddedRole = (room.embeddedParticipants || []).find((p) => p.userId === currentUser._id)?.role;
  let isPrivileged = embeddedRole === "admin" || embeddedRole === "moderator";
  if (!isPrivileged) {
    const membership = await ctx.db
      .query("chatParticipants")
      .withIndex("by_chat_and_user", (q) => q.eq("chatRoomId", room._id).eq("userId", currentUser._id))
      .first();
    isPrivileged = !!membership && (membership.role === "admin" || membership.role === "moderator");
  }
  if (!isPrivileged) {
    throw new Error("Only admins or moderators can pin messages");
  }

  await ctx.db.patch(args.messageId, { isPinned: args.isPinned, updatedAt: Date.now() });

  await logAction(
    ctx,
    "toggle_pin_chat_message",
    "DATA_CHANGE",
    "LOW",
    `${args.isPinned ? "Pinned" : "Unpinned"} message ${args.messageId}`,
    currentUser._id,
    room.organizationId,
    { messageId: args.messageId, isPinned: args.isPinned }
  );

  return true;
};

export const reactToMessageHandler = async (
  ctx: MutationCtx,
  args: { messageId: Id<"chatMessages">; emoji: string }
) => {
  const currentUser = await requireAuthentication(ctx);
  const now = Date.now();
  const message = await ctx.db.get(args.messageId);
  if (!message || message.isDeleted) {
    throw new Error("Message not found or deleted");
  }

  // Update embedded reactions efficiently
  const reactions = [...(message.reactions || [])];
  const existing = reactions.find((r) => r.emoji === args.emoji);
  if (existing) {
    const hasUser = existing.users.some((u) => u.userId === currentUser._id);
    if (hasUser) {
      // Remove reaction by this user
      existing.users = existing.users.filter((u) => u.userId !== currentUser._id);
      existing.count = Math.max(0, existing.users.length);
    } else {
      existing.users.push({ userId: currentUser._id, firstName: currentUser.firstName, createdAt: now });
      existing.count = existing.users.length;
    }
  } else {
    reactions.push({
      emoji: args.emoji,
      users: [{ userId: currentUser._id, firstName: currentUser.firstName, createdAt: now }],
      count: 1,
    });
  }

  await ctx.db.patch(args.messageId, { reactions, updatedAt: now });

  await logAction(
    ctx,
    "react_chat_message",
    "DATA_CHANGE",
    "LOW",
    `Reacted to message ${args.messageId} with ${args.emoji}`,
    currentUser._id,
    undefined,
    { messageId: args.messageId, emoji: args.emoji }
  );

  return true;
};

export const markRoomReadHandler = async (
  ctx: MutationCtx,
  args: { chatRoomId: Id<"chatRooms"> }
) => {
  const currentUser = await requireAuthentication(ctx);
  const now = Date.now();

  const state = await ctx.db
    .query("chatRoomState")
    .withIndex("by_chat_room", (q) => q.eq("chatRoomId", args.chatRoomId))
    .unique();
  if (!state) {
    return true;
  }

  const updated = state.unreadCounts.map((u) =>
    u.userId === currentUser._id ? { ...u, count: 0, lastReadAt: now } : u
  );
  await ctx.db.patch(state._id, { unreadCounts: updated, updatedAt: now });
  return true;
};


