import { QueryCtx } from "../../_generated/server";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";

// Get product by slug
export const getProductBySlugArgs = {
  slug: v.string(),
  organizationId: v.optional(v.id("organizations")),
  includeDeleted: v.optional(v.boolean()),
};

export const getProductBySlugHandler = async (
  ctx: QueryCtx,
  args: {
    slug: string;
    organizationId?: Id<"organizations">;
    includeDeleted?: boolean;
  }
) => {
  let query;
  
  if (args.organizationId) {
    // Search within organization
    query = ctx.db.query("products")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId!))
      .filter((q) => q.eq(q.field("slug"), args.slug));
  } else {
    // Search globally (products without organization)
    query = ctx.db.query("products")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .filter((q) => q.eq(q.field("organizationId"), undefined));
  }
  
  if (!args.includeDeleted) {
    query = query.filter((q) => q.eq(q.field("isDeleted"), false));
  }
  
  const product = await query.first();
  
  if (!product) {
    throw new Error("Product not found");
  }
  
  return product;
};
