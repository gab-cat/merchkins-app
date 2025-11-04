import { QueryCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';
import { requireAuthentication } from '../../helpers';

export const getMessagesArgs = {
  chatRoomId: v.id('chatRooms'),
  limit: v.optional(v.number()),
  before: v.optional(v.number()),
  includeDeleted: v.optional(v.boolean()),
};

export const getMessagesHandler = async (
  ctx: QueryCtx,
  args: { chatRoomId: Id<'chatRooms'>; limit?: number; before?: number; includeDeleted?: boolean }
) => {
  const currentUser = await requireAuthentication(ctx);
  const room = await ctx.db.get(args.chatRoomId);
  if (!room || !room.isActive) {
    throw new Error('Chat room not found or inactive');
  }

  // Only allow access if member
  const isMember =
    (room.embeddedParticipants || []).some((p) => p.userId === currentUser._id && p.isActive) ||
    !!(await ctx.db
      .query('chatParticipants')
      .withIndex('by_chat_and_user', (q) => q.eq('chatRoomId', args.chatRoomId).eq('userId', currentUser._id))
      .filter((q) => q.eq(q.field('isActive'), true))
      .first());
  if (!isMember) {
    throw new Error('Access denied to this chat room');
  }

  const limit = Math.max(1, Math.min(100, args.limit ?? 50));
  const before = args.before ?? Number.MAX_SAFE_INTEGER;

  let query = ctx.db
    .query('chatMessages')
    .withIndex('by_chat_and_created', (q) => q.eq('chatRoomId', args.chatRoomId).lte('createdAt', before))
    .order('desc');

  if (!args.includeDeleted) {
    query = query.filter((q) => q.eq(q.field('isDeleted'), false));
  }

  const messages = await query.take(limit);
  return messages.reverse();
};
