import { MutationCtx } from "../../_generated/server";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";

// Update organization details
export const updateOrganizationArgs = {
  organizationId: v.id("organizations"),
  name: v.optional(v.string()),
  description: v.optional(v.string()),
  logo: v.optional(v.string()),
  bannerImage: v.optional(v.string()),
  website: v.optional(v.string()),
  industry: v.optional(v.string()),
  size: v.optional(v.string()),
  organizationType: v.optional(v.union(v.literal("PUBLIC"), v.literal("PRIVATE"), v.literal("SECRET"))),
  themeSettings: v.optional(v.object({
    primaryColor: v.string(),
    secondaryColor: v.optional(v.string()),
    mode: v.optional(v.union(v.literal("light"), v.literal("dark"), v.literal("auto"))),
    fontFamily: v.optional(v.string()),
    borderRadius: v.optional(v.union(v.literal("none"), v.literal("small"), v.literal("medium"), v.literal("large"))),
  })),
};

export const updateOrganizationHandler = async (
  ctx: MutationCtx,
  args: {
    organizationId: Id<"organizations">;
    name?: string;
    description?: string;
    logo?: string;
    bannerImage?: string;
    website?: string;
    industry?: string;
    size?: string;
    organizationType?: "PUBLIC" | "PRIVATE" | "SECRET";
    themeSettings?: {
      primaryColor: string;
      secondaryColor?: string;
      mode?: "light" | "dark" | "auto";
      fontFamily?: string;
      borderRadius?: "none" | "small" | "medium" | "large";
    };
  }
) => {
  const { organizationId, ...updates } = args;
  
  // Get current organization
  const organization = await ctx.db.get(organizationId);
  if (!organization || organization.isDeleted) {
    throw new Error("Organization not found");
  }
  
  // Update organization
  await ctx.db.patch(organizationId, {
    ...updates,
    updatedAt: Date.now(),
  });
  
  // If name or slug changed, update embedded organization info in members
  if (updates.name || updates.organizationType) {
    const members = await ctx.db
      .query("organizationMembers")
      .withIndex("by_organization", (q) => q.eq("organizationId", organizationId))
      .collect();
    
    for (const member of members) {
      await ctx.db.patch(member._id, {
        organizationInfo: {
          name: updates.name || organization.name,
          slug: organization.slug,
          logo: updates.logo || organization.logo,
          organizationType: updates.organizationType || organization.organizationType,
        },
        updatedAt: Date.now(),
      });
    }
  }
  
  return { success: true };
};
