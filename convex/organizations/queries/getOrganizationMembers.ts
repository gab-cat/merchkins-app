import { QueryCtx } from "../../_generated/server";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";
import { requireOrganizationMember } from "../../helpers";

// Get organization members
export const getOrganizationMembersArgs = {
  organizationId: v.id("organizations"),
  role: v.optional(v.union(v.literal("ADMIN"), v.literal("STAFF"), v.literal("MEMBER"))),
  isActive: v.optional(v.boolean()),
  limit: v.optional(v.number()),
  cursor: v.optional(v.string()),
};

export const getOrganizationMembersHandler = async (
  ctx: QueryCtx,
  args: {
    organizationId: Id<"organizations">;
    role?: "ADMIN" | "STAFF" | "MEMBER";
    isActive?: boolean;
    limit?: number;
    cursor?: string;
  }
) => {
  const { organizationId, role, isActive = true, limit = 50, cursor } = args;
  
  // Require organization membership to view members
  await requireOrganizationMember(ctx, organizationId);
  
  let queryBuilder;
  
  // Apply filters
  if (role) {
    queryBuilder = ctx.db.query("organizationMembers").withIndex("by_organization_role", (q) => 
      q.eq("organizationId", organizationId).eq("role", role)
    );
  } else {
    queryBuilder = ctx.db.query("organizationMembers").withIndex("by_organization", (q) => q.eq("organizationId", organizationId));
  }
  
  queryBuilder = queryBuilder.filter((q) => q.eq(q.field("isActive"), isActive));
  
  // Apply pagination
  const results = await queryBuilder
    .order("desc")
    .paginate({
      numItems: limit,
      cursor: cursor || null,
    });
  
  return results;
};
