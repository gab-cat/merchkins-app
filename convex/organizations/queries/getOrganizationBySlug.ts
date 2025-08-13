import { QueryCtx } from "../../_generated/server";
import { v } from "convex/values";

// Get organization by slug
export const getOrganizationBySlugArgs = {
  slug: v.string(),
};

export const getOrganizationBySlugHandler = async (
  ctx: QueryCtx,
  args: { slug: string }
) => {
  const organization = await ctx.db
    .query("organizations")
    .withIndex("by_slug", (q) => q.eq("slug", args.slug))
    .filter((q) => q.eq(q.field("isDeleted"), false))
    .first();

  return organization;
};
