import { QueryCtx } from "../../_generated/server";
import { v } from "convex/values";

// Get all users with pagination and filters
export const getUsersArgs = {
  limit: v.optional(v.number()),
  cursor: v.optional(v.string()),
  isStaff: v.optional(v.boolean()),
  isAdmin: v.optional(v.boolean()),
  isMerchant: v.optional(v.boolean()),
  search: v.optional(v.string()),
};

export const getUsersHandler = async (
  ctx: QueryCtx,
  args: {
    limit?: number;
    cursor?: string;
    isStaff?: boolean;
    isAdmin?: boolean;
    isMerchant?: boolean;
    search?: string;
  }
) => {
  const { limit = 50, cursor, isStaff, isAdmin, isMerchant, search } = args;
  
  let queryBuilder;
  
  // Apply filters based on role
  if (isStaff !== undefined) {
    queryBuilder = ctx.db.query("users").withIndex("by_isStaff", (q) => q.eq("isStaff", isStaff));
  } else if (isAdmin !== undefined) {
    queryBuilder = ctx.db.query("users").withIndex("by_isAdmin", (q) => q.eq("isAdmin", isAdmin));
  } else if (isMerchant !== undefined) {
    queryBuilder = ctx.db.query("users").withIndex("by_isMerchant", (q) => q.eq("isMerchant", isMerchant));
  } else {
    queryBuilder = ctx.db.query("users");
  }
  
  // Filter out deleted users
  queryBuilder = queryBuilder.filter((q) => q.eq(q.field("isDeleted"), false));
  
  // Apply search filter if provided
  if (search) {
    queryBuilder = queryBuilder.filter((q) =>
      q.or(
        q.eq(q.field("firstName"), search),
        q.eq(q.field("lastName"), search),
        q.eq(q.field("email"), search)
      )
    );
  }
  
  // Apply pagination
  const results = await queryBuilder
    .order("desc")
    .paginate({
      numItems: limit,
      cursor: cursor || null,
    });
  
  return results;
};
