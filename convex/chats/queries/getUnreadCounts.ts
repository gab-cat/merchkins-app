import { QueryCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';
import { requireAuthentication } from '../../helpers';

export const getUnreadCountsArgs = {
  chatRoomId: v.id('chatRooms'),
};

export const getUnreadCountsHandler = async (ctx: QueryCtx, args: { chatRoomId: Id<'chatRooms'> }) => {
  const currentUser = await requireAuthentication(ctx);
  const state = await ctx.db
    .query('chatRoomState')
    .withIndex('by_chat_room', (q) => q.eq('chatRoomId', args.chatRoomId))
    .unique();
  if (!state) return { count: 0 };

  const entry = state.unreadCounts.find((u) => u.userId === currentUser._id);
  return { count: entry ? entry.count : 0 };
};
