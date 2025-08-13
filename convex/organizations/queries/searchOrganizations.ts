import { QueryCtx } from "../../_generated/server";
import { v } from "convex/values";

// Search organizations by name or description
export const searchOrganizationsArgs = {
  searchTerm: v.string(),
  limit: v.optional(v.number()),
  organizationType: v.optional(v.union(v.literal("PUBLIC"), v.literal("PRIVATE"), v.literal("SECRET"))),
};

export const searchOrganizationsHandler = async (
  ctx: QueryCtx,
  args: {
    searchTerm: string;
    limit?: number;
    organizationType?: "PUBLIC" | "PRIVATE" | "SECRET";
  }
) => {
  const { searchTerm, limit = 20, organizationType } = args;
  
  if (searchTerm.length < 2) {
    return [];
  }
  
  // Get all active organizations
  let organizations = await ctx.db
    .query("organizations")
    .filter((q) => q.eq(q.field("isDeleted"), false))
    .collect();
  
  // Apply organization type filter
  if (organizationType) {
    organizations = organizations.filter(org => org.organizationType === organizationType);
  }
  
  // Search by name, slug, or description (case insensitive)
  const searchLower = searchTerm.toLowerCase();
  const filteredOrganizations = organizations.filter(org => {
    const name = org.name.toLowerCase();
    const slug = org.slug.toLowerCase();
    const description = org.description?.toLowerCase() || "";
    
    return (
      name.includes(searchLower) ||
      slug.includes(searchLower) ||
      description.includes(searchLower)
    );
  });
  
  // Limit results
  return filteredOrganizations.slice(0, limit);
};
