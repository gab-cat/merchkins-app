import { QueryCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';
import { requireAuthentication } from '../../helpers';

export const getChatRoomByIdArgs = {
  chatRoomId: v.id('chatRooms'),
};

export const getChatRoomByIdHandler = async (ctx: QueryCtx, args: { chatRoomId: Id<'chatRooms'> }) => {
  const currentUser = await requireAuthentication(ctx);
  const room = await ctx.db.get(args.chatRoomId);
  if (!room || !room.isActive) {
    return null;
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
  return room;
};
