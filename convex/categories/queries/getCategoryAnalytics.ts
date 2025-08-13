import { QueryCtx } from "../../_generated/server";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";

// Get category analytics and statistics
export const getCategoryAnalyticsArgs = {
  organizationId: v.optional(v.id("organizations")),
  categoryId: v.optional(v.id("categories")),
  dateFrom: v.optional(v.number()),
  dateTo: v.optional(v.number()),
};

export const getCategoryAnalyticsHandler = async (
  ctx: QueryCtx,
  args: {
    organizationId?: Id<"organizations">;
    categoryId?: Id<"categories">;
    dateFrom?: number;
    dateTo?: number;
  }
) => {
  // If specific category is requested
  if (args.categoryId) {
    const category = await ctx.db.get(args.categoryId);
    if (!category || category.isDeleted) {
      return null;
    }
    
    return {
      categoryId: args.categoryId,
      name: category.name,
      slug: category.slug,
      level: category.level,
      productCount: category.productCount,
      activeProductCount: category.activeProductCount,
      totalOrderCount: category.totalOrderCount,
      totalRevenue: category.totalRevenue,
      isActive: category.isActive,
      isFeatured: category.isFeatured,
    };
  }
  
  // Organization-wide analytics
  let query;
  
  if (args.organizationId) {
    query = ctx.db.query("categories")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId!));
  } else {
    query = ctx.db.query("categories");
  }
  
  const categories = await query
    .filter((q) => q.eq(q.field("isDeleted"), false))
    .collect();
  
  const analytics = {
    totalCategories: categories.length,
    activeCategories: categories.filter(c => c.isActive).length,
    inactiveCategories: categories.filter(c => !c.isActive).length,
    featuredCategories: categories.filter(c => c.isFeatured).length,
    rootCategories: categories.filter(c => c.level === 0).length,
    subcategories: categories.filter(c => c.level > 0).length,
    totalProducts: categories.reduce((sum, c) => sum + c.productCount, 0),
    totalActiveProducts: categories.reduce((sum, c) => sum + c.activeProductCount, 0),
    totalOrders: categories.reduce((sum, c) => sum + c.totalOrderCount, 0),
    totalRevenue: categories.reduce((sum, c) => sum + c.totalRevenue, 0),
    categoryLevels: {
      level0: categories.filter(c => c.level === 0).length,
      level1: categories.filter(c => c.level === 1).length,
      level2: categories.filter(c => c.level === 2).length,
      level3Plus: categories.filter(c => c.level >= 3).length,
    },
    topCategories: {
      byProducts: categories
        .filter(c => c.isActive)
        .sort((a, b) => b.productCount - a.productCount)
        .slice(0, 5)
        .map(c => ({
          id: c._id,
          name: c.name,
          slug: c.slug,
          productCount: c.productCount,
        })),
      byRevenue: categories
        .filter(c => c.isActive)
        .sort((a, b) => b.totalRevenue - a.totalRevenue)
        .slice(0, 5)
        .map(c => ({
          id: c._id,
          name: c.name,
          slug: c.slug,
          totalRevenue: c.totalRevenue,
        })),
      byOrders: categories
        .filter(c => c.isActive)
        .sort((a, b) => b.totalOrderCount - a.totalOrderCount)
        .slice(0, 5)
        .map(c => ({
          id: c._id,
          name: c.name,
          slug: c.slug,
          totalOrderCount: c.totalOrderCount,
        })),
    },
    emptyCategories: categories.filter(c => c.activeProductCount === 0).length,
    averageProductsPerCategory: categories.length > 0 
      ? Math.round((categories.reduce((sum, c) => sum + c.productCount, 0) / categories.length) * 100) / 100
      : 0,
  };
  
  return analytics;
};
