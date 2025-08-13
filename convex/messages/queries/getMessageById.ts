import { QueryCtx } from "../../_generated/server";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";
import { requireAuthentication, requireOrganizationPermission } from "../../helpers";

export const getMessageByIdArgs = {
  messageId: v.id("messages"),
};

export const getMessageByIdHandler = async (
  ctx: QueryCtx,
  args: { messageId: Id<"messages"> }
) => {
  const user = await requireAuthentication(ctx);
  const message = await ctx.db.get(args.messageId);
  if (!message) {
    throw new Error("Message not found");
  }

  if (message.organizationId) {
    await requireOrganizationPermission(ctx, message.organizationId, "MANAGE_TICKETS", "read");
  } else if (!(user.isAdmin || message.sentBy === user._id)) {
    throw new Error("Permission denied: You can only view your own messages");
  }

  return message;
};


