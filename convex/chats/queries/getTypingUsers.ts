import { QueryCtx } from "../../_generated/server";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";
import { requireAuthentication } from "../../helpers";

export const getTypingUsersArgs = {
  chatRoomId: v.id("chatRooms"),
};

export const getTypingUsersHandler = async (
  ctx: QueryCtx,
  args: { chatRoomId: Id<"chatRooms"> }
) => {
  const currentUser = await requireAuthentication(ctx);
  const state = await ctx.db
    .query("chatRoomState")
    .withIndex("by_chat_room", (q) => q.eq("chatRoomId", args.chatRoomId))
    .unique();
  if (!state) return [];
  // Return others typing
  return state.typingUsers.filter((u) => u.userId !== currentUser._id);
};


