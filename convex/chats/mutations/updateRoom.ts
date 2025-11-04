import { MutationCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';
import { requireAuthentication, sanitizeString, logAction } from '../../helpers';

export const updateRoomArgs = {
  chatRoomId: v.id('chatRooms'),
  name: v.optional(v.string()),
  description: v.optional(v.string()),
  isActive: v.optional(v.boolean()),
};

export const updateRoomHandler = async (
  ctx: MutationCtx,
  args: { chatRoomId: Id<'chatRooms'>; name?: string; description?: string; isActive?: boolean }
) => {
  const currentUser = await requireAuthentication(ctx);
  const room = await ctx.db.get(args.chatRoomId);
  if (!room) {
    throw new Error('Chat room not found');
  }

  // Only admins or moderators can update room info
  const embeddedRole = (room.embeddedParticipants || []).find((p) => p.userId === currentUser._id)?.role;
  let isPrivileged = embeddedRole === 'admin' || embeddedRole === 'moderator';
  if (!isPrivileged) {
    const membership = await ctx.db
      .query('chatParticipants')
      .withIndex('by_chat_and_user', (q) => q.eq('chatRoomId', room._id).eq('userId', currentUser._id))
      .first();
    isPrivileged = !!membership && (membership.role === 'admin' || membership.role === 'moderator');
  }
  if (!isPrivileged) {
    throw new Error('Only admins or moderators can update the chat room');
  }

  const updates: Record<string, unknown> = { updatedAt: Date.now() };
  if (args.name !== undefined) updates.name = sanitizeString(args.name);
  if (args.description !== undefined) updates.description = sanitizeString(args.description);
  if (args.isActive !== undefined) updates.isActive = args.isActive;

  await ctx.db.patch(args.chatRoomId, updates);

  await logAction(ctx, 'update_chat_room', 'DATA_CHANGE', 'LOW', `Updated room ${args.chatRoomId}`, currentUser._id, room.organizationId, {
    chatRoomId: args.chatRoomId,
    updates,
  });

  return true;
};
