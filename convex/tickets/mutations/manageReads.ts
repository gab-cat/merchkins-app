import { MutationCtx } from "../../_generated/server";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";
import { requireAuthentication } from "../../helpers";

export const markTicketReadArgs = {
  ticketId: v.id("tickets"),
};

export const markTicketReadHandler = async (
  ctx: MutationCtx,
  args: { ticketId: Id<"tickets"> }
) => {
  const user = await requireAuthentication(ctx);
  const now = Date.now();

  // Upsert ticketReads row
  const existing = await ctx.db
    .query("ticketReads")
    .withIndex("by_ticket_and_user", (q) => q.eq("ticketId", args.ticketId).eq("userId", user._id))
    .unique();
  if (existing) {
    await ctx.db.patch(existing._id, { lastReadAt: now });
  } else {
    await ctx.db.insert("ticketReads", { ticketId: args.ticketId, userId: user._id, lastReadAt: now });
  }
  return true;
};


