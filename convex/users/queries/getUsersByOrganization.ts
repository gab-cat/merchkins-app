import { QueryCtx } from "../../_generated/server";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";

// Get users by organization
export const getUsersByOrganizationArgs = {
  organizationId: v.id("organizations"),
  limit: v.optional(v.number()),
  cursor: v.optional(v.string()),
};

export const getUsersByOrganizationHandler = async (
  ctx: QueryCtx,
  args: {
    organizationId: Id<"organizations">;
    limit?: number;
    cursor?: string;
  }
) => {
  const { organizationId, limit = 50, cursor } = args;
  
  // Query all active users
  const results = await ctx.db
    .query("users")
    .filter((q) => q.eq(q.field("isDeleted"), false))
    .order("desc")
    .paginate({
      numItems: limit,
      cursor: cursor || null,
    });
  
  // Filter users that are members of the specified organization
  const filteredPage = {
    ...results,
    page: results.page.filter(user => 
      (user.organizationMemberships || []).some(
        membership => membership.organizationId === organizationId && membership.isActive
      )
    ),
  };
  
  return filteredPage;
};
