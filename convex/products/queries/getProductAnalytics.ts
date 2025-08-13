import { QueryCtx } from "../../_generated/server";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";

// Get product analytics including sales, views, ratings, etc.
export const getProductAnalyticsArgs = {
  productId: v.optional(v.id("products")),
  organizationId: v.optional(v.id("organizations")),
  categoryId: v.optional(v.id("categories")),
  timeframe: v.optional(v.union(v.literal("day"), v.literal("week"), v.literal("month"), v.literal("quarter"), v.literal("year"), v.literal("all"))),
  groupBy: v.optional(v.union(v.literal("day"), v.literal("week"), v.literal("month"))),
};

export const getProductAnalyticsHandler = async (
  ctx: QueryCtx,
  args: {
    productId?: Id<"products">;
    organizationId?: Id<"organizations">;
    categoryId?: Id<"categories">;
    timeframe?: "day" | "week" | "month" | "quarter" | "year" | "all";
    groupBy?: "day" | "week" | "month";
  }
) => {
  let query;
  
  // Build query based on scope
  if (args.productId) {
    const product = await ctx.db.get(args.productId);
    if (!product || product.isDeleted) {
      throw new Error("Product not found");
    }
    
    // Return analytics for specific product
    return {
      totalProducts: 1,
      totalViews: product.viewCount,
      totalOrders: product.totalOrders,
      totalRevenue: product.variants.reduce((sum, variant) => 
        sum + (variant.price * variant.orderCount), 0
      ),
      averageRating: product.rating,
      totalReviews: product.reviewsCount,
      totalVariants: product.totalVariants,
      inventoryCount: product.inventory,
      activeVariants: product.variants.filter(v => v.inventory > 0).length,
      topVariants: product.variants
        .sort((a, b) => b.orderCount - a.orderCount)
        .slice(0, 5)
        .map(variant => ({
          variantId: variant.variantId,
          variantName: variant.variantName,
          price: variant.price,
          orderCount: variant.orderCount,
          inventory: variant.inventory,
          revenue: variant.price * variant.orderCount,
        })),
      product,
    };
  }
  
  // Build query for multiple products
  if (args.organizationId && args.categoryId) {
    query = ctx.db.query("products")
      .withIndex("by_organization_category", (q) => 
        q.eq("organizationId", args.organizationId!).eq("categoryId", args.categoryId!)
      );
  } else if (args.organizationId) {
    query = ctx.db.query("products")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId!));
  } else if (args.categoryId) {
    query = ctx.db.query("products")
      .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId!));
  } else {
    query = ctx.db.query("products")
      .withIndex("by_isDeleted", (q) => q.eq("isDeleted", false));
  }
  
  // Apply timeframe filter
  if (args.timeframe && args.timeframe !== "all") {
    const now = Date.now();
    let timeThreshold: number;
    
    switch (args.timeframe) {
      case "day":
        timeThreshold = now - (24 * 60 * 60 * 1000);
        break;
      case "week":
        timeThreshold = now - (7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        timeThreshold = now - (30 * 24 * 60 * 60 * 1000);
        break;
      case "quarter":
        timeThreshold = now - (90 * 24 * 60 * 60 * 1000);
        break;
      case "year":
        timeThreshold = now - (365 * 24 * 60 * 60 * 1000);
        break;
      default:
        timeThreshold = 0;
    }
    
    query = query.filter((q) => q.and(
      q.eq(q.field("isDeleted"), false),
      q.gte(q.field("createdAt"), timeThreshold)
    ));
  } else {
    query = query.filter((q) => q.eq(q.field("isDeleted"), false));
  }
  
  const products = await query.collect();
  
  // Calculate aggregated analytics
  const analytics = products.reduce((acc, product) => {
    const productRevenue = product.variants.reduce((sum, variant) => 
      sum + (variant.price * variant.orderCount), 0
    );
    
    return {
      totalProducts: acc.totalProducts + 1,
      totalViews: acc.totalViews + product.viewCount,
      totalOrders: acc.totalOrders + product.totalOrders,
      totalRevenue: acc.totalRevenue + productRevenue,
      totalReviews: acc.totalReviews + product.reviewsCount,
      totalVariants: acc.totalVariants + product.totalVariants,
      totalInventory: acc.totalInventory + product.inventory,
      ratingSum: acc.ratingSum + (product.rating * product.reviewsCount),
      reviewsCount: acc.reviewsCount + product.reviewsCount,
    };
  }, {
    totalProducts: 0,
    totalViews: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalReviews: 0,
    totalVariants: 0,
    totalInventory: 0,
    ratingSum: 0,
    reviewsCount: 0,
  });
  
  // Calculate derived metrics
  const averageRating = analytics.reviewsCount > 0 
    ? analytics.ratingSum / analytics.reviewsCount 
    : 0;
  
  const averageOrdersPerProduct = analytics.totalProducts > 0
    ? analytics.totalOrders / analytics.totalProducts
    : 0;
  
  const averageRevenuePerProduct = analytics.totalProducts > 0
    ? analytics.totalRevenue / analytics.totalProducts
    : 0;
  
  const averageRevenuePerOrder = analytics.totalOrders > 0
    ? analytics.totalRevenue / analytics.totalOrders
    : 0;
  
  // Get top performing products
  const topProducts = products
    .sort((a, b) => {
      const aRevenue = a.variants.reduce((sum, variant) => 
        sum + (variant.price * variant.orderCount), 0
      );
      const bRevenue = b.variants.reduce((sum, variant) => 
        sum + (variant.price * variant.orderCount), 0
      );
      return bRevenue - aRevenue;
    })
    .slice(0, 10)
    .map(product => {
      const revenue = product.variants.reduce((sum, variant) => 
        sum + (variant.price * variant.orderCount), 0
      );
      return {
        productId: product._id,
        title: product.title,
        slug: product.slug,
        imageUrl: product.imageUrl[0],
        totalOrders: product.totalOrders,
        viewCount: product.viewCount,
        rating: product.rating,
        reviewsCount: product.reviewsCount,
        revenue,
        variants: product.totalVariants,
      };
    });
  
  // Get category breakdown if not filtering by specific category
  const categoryBreakdown = args.categoryId ? [] : products.reduce((acc, product) => {
    if (!product.categoryInfo?.name) return acc;
    
    const existing = acc.find(item => item.categoryName === product.categoryInfo!.name);
    if (existing) {
      existing.productCount += 1;
      existing.totalOrders += product.totalOrders;
      existing.totalViews += product.viewCount;
    } else {
      acc.push({
        categoryId: product.categoryId,
        categoryName: product.categoryInfo.name,
        productCount: 1,
        totalOrders: product.totalOrders,
        totalViews: product.viewCount,
      });
    }
    
    return acc;
  }, [] as Array<{
    categoryId?: Id<"categories">;
    categoryName: string;
    productCount: number;
    totalOrders: number;
    totalViews: number;
  }>);
  
  return {
    ...analytics,
    averageRating,
    averageOrdersPerProduct,
    averageRevenuePerProduct,
    averageRevenuePerOrder,
    topProducts,
    categoryBreakdown,
    timeframe: args.timeframe || "all",
  };
};
