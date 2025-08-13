import { QueryCtx } from "../../_generated/server";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";
import { requireAuthentication, requireOrganizationPermission } from "../../helpers";

export const getConversationArgs = {
  conversationId: v.string(),
};

export const getConversationHandler = async (
  ctx: QueryCtx,
  args: { conversationId: string }
) => {
  const user = await requireAuthentication(ctx);

  // Find a representative message to derive access
  const anyMsg = await ctx.db
    .query("messages")
    .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
    .first();

  if (!anyMsg) {
    return { conversationId: args.conversationId, messages: [] };
  }

  if (anyMsg.organizationId) {
    await requireOrganizationPermission(ctx, anyMsg.organizationId, "MANAGE_TICKETS", "read");
  } else if (!(user.isAdmin || anyMsg.sentBy === user._id)) {
    throw new Error("Permission denied: You can only view your own conversations");
  }

  const items = await ctx.db
    .query("messages")
    .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
    .collect();

  items.sort((a, b) => a.createdAt - b.createdAt);

  return { conversationId: args.conversationId, messages: items };
};


