import { QueryCtx } from "../../_generated/server";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";

// Get popular categories by various metrics
export const getPopularCategoriesArgs = {
  organizationId: v.optional(v.id("organizations")),
  metric: v.optional(v.union(
    v.literal("products"),
    v.literal("orders"),
    v.literal("revenue")
  )),
  limit: v.optional(v.number()),
  includeEmpty: v.optional(v.boolean()),
};

export const getPopularCategoriesHandler = async (
  ctx: QueryCtx,
  args: {
    organizationId?: Id<"organizations">;
    metric?: "products" | "orders" | "revenue";
    limit?: number;
    includeEmpty?: boolean;
  }
) => {
  let query;
  
  if (args.organizationId) {
    query = ctx.db.query("categories")
      .withIndex("by_organization_active", (q) => 
        q.eq("organizationId", args.organizationId!).eq("isActive", true)
      );
  } else {
    query = ctx.db.query("categories")
      .withIndex("by_active", (q) => q.eq("isActive", true));
  }
  
  let categories = await query
    .filter((q) => q.eq(q.field("isDeleted"), false))
    .collect();
  
  // Filter out empty categories if requested
  if (!args.includeEmpty) {
    categories = categories.filter(c => c.activeProductCount > 0);
  }
  
  const metric = args.metric || "products";
  
  // Sort by the requested metric
  categories.sort((a, b) => {
    switch (metric) {
      case "products":
        return b.activeProductCount - a.activeProductCount;
      case "orders":
        return b.totalOrderCount - a.totalOrderCount;
      case "revenue":
        return b.totalRevenue - a.totalRevenue;
      default:
        return b.activeProductCount - a.activeProductCount;
    }
  });
  
  // Apply limit
  const limit = args.limit || 10;
  const popularCategories = categories.slice(0, limit);
  
  return popularCategories.map(category => ({
    id: category._id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    imageUrl: category.imageUrl,
    iconUrl: category.iconUrl,
    color: category.color,
    level: category.level,
    productCount: category.productCount,
    activeProductCount: category.activeProductCount,
    totalOrderCount: category.totalOrderCount,
    totalRevenue: category.totalRevenue,
    isFeatured: category.isFeatured,
    organizationInfo: category.organizationInfo,
  }));
};
