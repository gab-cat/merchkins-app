import { QueryCtx } from "../../_generated/server";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";

// Get users managed by a specific manager
export const getUsersByManagerArgs = {
  managerId: v.id("users"),
  limit: v.optional(v.number()),
  cursor: v.optional(v.string()),
};

export const getUsersByManagerHandler = async (
  ctx: QueryCtx,
  args: {
    managerId: Id<"users">;
    limit?: number;
    cursor?: string;
  }
) => {
  const { managerId, limit = 50, cursor } = args;
  
  const results = await ctx.db
    .query("users")
    .withIndex("by_manager", (q) => q.eq("managerId", managerId))
    .filter((q) => q.eq(q.field("isDeleted"), false))
    .order("desc")
    .paginate({
      numItems: limit,
      cursor: cursor || null,
    });
  
  return results;
};
