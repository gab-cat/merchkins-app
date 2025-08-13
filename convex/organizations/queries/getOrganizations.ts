import { QueryCtx } from "../../_generated/server";
import { v } from "convex/values";

// Get all organizations with pagination and filters
export const getOrganizationsArgs = {
  limit: v.optional(v.number()),
  cursor: v.optional(v.string()),
  organizationType: v.optional(v.union(v.literal("PUBLIC"), v.literal("PRIVATE"), v.literal("SECRET"))),
  search: v.optional(v.string()),
};

export const getOrganizationsHandler = async (
  ctx: QueryCtx,
  args: {
    limit?: number;
    cursor?: string;
    organizationType?: "PUBLIC" | "PRIVATE" | "SECRET";
    search?: string;
  }
) => {
  const { limit = 50, cursor, organizationType, search } = args;
  
  let queryBuilder;
  
  // Apply organization type filter
  if (organizationType) {
    queryBuilder = ctx.db.query("organizations").withIndex("by_organizationType", (q) => q.eq("organizationType", organizationType));
  } else {
    queryBuilder = ctx.db.query("organizations");
  }
  
  // Filter out deleted organizations
  queryBuilder = queryBuilder.filter((q) => q.eq(q.field("isDeleted"), false));
  
  // Apply search filter if provided
  if (search) {
    queryBuilder = queryBuilder.filter((q) =>
      q.or(
        q.eq(q.field("name"), search),
        q.eq(q.field("slug"), search),
        q.eq(q.field("description"), search)
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
