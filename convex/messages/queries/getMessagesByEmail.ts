import { QueryCtx } from "../../_generated/server";
import { v } from "convex/values";
import { requireAuthentication } from "../../helpers";

export const getMessagesByEmailArgs = {
  email: v.string(),
  limit: v.optional(v.number()),
};

export const getMessagesByEmailHandler = async (
  ctx: QueryCtx,
  args: { email: string; limit?: number }
) => {
  await requireAuthentication(ctx);

  const rows = await ctx.db
    .query("messages")
    .withIndex("by_email", (q) => q.eq("email", args.email))
    .collect();

  rows.sort((a, b) => b.createdAt - a.createdAt);
  const limit = args.limit || 100;
  return rows.slice(0, limit);
};


