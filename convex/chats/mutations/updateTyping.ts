import { MutationCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';
import { requireAuthentication } from '../../helpers';

export const setTypingArgs = {
  chatRoomId: v.id('chatRooms'),
  isTyping: v.boolean(),
};

export const setTypingHandler = async (ctx: MutationCtx, args: { chatRoomId: Id<'chatRooms'>; isTyping: boolean }) => {
  const currentUser = await requireAuthentication(ctx);
  const now = Date.now();

  const state = await ctx.db
    .query('chatRoomState')
    .withIndex('by_chat_room', (q) => q.eq('chatRoomId', args.chatRoomId))
    .unique();

  if (!state) return true;

  const typing = [...state.typingUsers];
  const idx = typing.findIndex((t) => t.userId === currentUser._id);
  if (args.isTyping) {
    if (idx === -1) {
      typing.push({ userId: currentUser._id, firstName: currentUser.firstName, startedTypingAt: now });
    } else {
      typing[idx] = { ...typing[idx], startedTypingAt: now };
    }
  } else if (idx !== -1) {
    typing.splice(idx, 1);
  }

  await ctx.db.patch(state._id, { typingUsers: typing, updatedAt: now });
  return true;
};
