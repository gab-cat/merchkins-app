import { QueryCtx } from "../../_generated/server";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";

// Get category by slug
export const getCategoryBySlugArgs = {
  slug: v.string(),
  organizationId: v.optional(v.id("organizations")),
};

export const getCategoryBySlugHandler = async (
  ctx: QueryCtx,
  args: { 
    slug: string;
    organizationId?: Id<"organizations">;
  }
) => {
  const query = args.organizationId
    ? ctx.db.query("categories")
        .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
        .filter((q) => q.and(
          q.eq(q.field("slug"), args.slug),
          q.eq(q.field("isDeleted"), false)
        ))
    : ctx.db.query("categories")
        .withIndex("by_slug", (q) => q.eq("slug", args.slug))
        .filter((q) => q.and(
          q.eq(q.field("organizationId"), undefined),
          q.eq(q.field("isDeleted"), false)
        ));
  
  const category = await query.first();
  return category || null;
};
