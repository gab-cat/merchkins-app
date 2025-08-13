import { QueryCtx } from "../../_generated/server";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";

// Get products with filtering and pagination
export const getProductsArgs = {
  organizationId: v.optional(v.id("organizations")),
  categoryId: v.optional(v.id("categories")),
  postedById: v.optional(v.id("users")),
  inventoryType: v.optional(v.union(v.literal("PREORDER"), v.literal("STOCK"))),
  isBestPrice: v.optional(v.boolean()),
  tags: v.optional(v.array(v.string())),
  minRating: v.optional(v.number()),
  maxRating: v.optional(v.number()),
  minPrice: v.optional(v.number()),
  maxPrice: v.optional(v.number()),
  hasInventory: v.optional(v.boolean()),
  includeDeleted: v.optional(v.boolean()),
  sortBy: v.optional(v.union(
    v.literal("newest"),
    v.literal("oldest"),
    v.literal("rating"),
    v.literal("price_low"),
    v.literal("price_high"),
    v.literal("popular"),
    v.literal("orders"),
    v.literal("views")
  )),
  limit: v.optional(v.number()),
  offset: v.optional(v.number()),
};

export const getProductsHandler = async (
  ctx: QueryCtx,
  args: {
    organizationId?: Id<"organizations">;
    categoryId?: Id<"categories">;
    postedById?: Id<"users">;
    inventoryType?: "PREORDER" | "STOCK";
    isBestPrice?: boolean;
    tags?: string[];
    minRating?: number;
    maxRating?: number;
    minPrice?: number;
    maxPrice?: number;
    hasInventory?: boolean;
    includeDeleted?: boolean;
    sortBy?: "newest" | "oldest" | "rating" | "price_low" | "price_high" | "popular" | "orders" | "views";
    limit?: number;
    offset?: number;
  }
) => {
  let query;
  
  // Choose the most specific index
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
  } else if (args.postedById) {
    query = ctx.db.query("products")
      .withIndex("by_creator", (q) => q.eq("postedById", args.postedById!));
  } else if (args.inventoryType) {
    query = ctx.db.query("products")
      .withIndex("by_inventory_type", (q) => q.eq("inventoryType", args.inventoryType!));
  } else if (args.isBestPrice !== undefined) {
    query = ctx.db.query("products")
      .withIndex("by_best_price", (q) => q.eq("isBestPrice", args.isBestPrice!));
  } else if (args.sortBy === "rating") {
    query = ctx.db.query("products")
      .withIndex("by_rating");
  } else if (args.sortBy === "views") {
    query = ctx.db.query("products")
      .withIndex("by_view_count");
  } else {
    query = ctx.db.query("products")
      .withIndex("by_isDeleted", (q) => q.eq("isDeleted", false));
  }
  
  // Apply filters
  const filteredQuery = query.filter((q) => {
    const conditions = [];
    
    // Deleted filter
    if (!args.includeDeleted) {
      conditions.push(q.eq(q.field("isDeleted"), false));
    }
    
    // Rating filter
    if (args.minRating !== undefined) {
      conditions.push(q.gte(q.field("rating"), args.minRating));
    }
    
    if (args.maxRating !== undefined) {
      conditions.push(q.lte(q.field("rating"), args.maxRating));
    }
    
    // Price filter (using minPrice from variants)
    if (args.minPrice !== undefined) {
      conditions.push(q.gte(q.field("minPrice"), args.minPrice));
    }
    
    if (args.maxPrice !== undefined) {
      conditions.push(q.lte(q.field("maxPrice"), args.maxPrice));
    }
    
    // Inventory filter
    if (args.hasInventory !== undefined) {
      if (args.hasInventory) {
        conditions.push(q.gt(q.field("inventory"), 0));
      } else {
        conditions.push(q.eq(q.field("inventory"), 0));
      }
    }
    
    // Note: Tags filter will be applied in post-processing due to Convex limitations
    // with array field queries
    
    return conditions.length > 0 ? q.and(...conditions) : q.and();
  });
  
  // Get results
  let results = await filteredQuery.collect();
  
  // Apply tags filter in post-processing
  if (args.tags && args.tags.length > 0) {
    results = results.filter(product => 
      args.tags!.some(tag => product.tags.includes(tag))
    );
  }
  
  // Apply sorting
  const sortBy = args.sortBy || "newest";
  results.sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return b.createdAt - a.createdAt;
      case "oldest":
        return a.createdAt - b.createdAt;
      case "rating":
        if (b.rating !== a.rating) return b.rating - a.rating;
        return b.reviewsCount - a.reviewsCount;
      case "price_low":
        const aMinPrice = a.minPrice || Number.MAX_VALUE;
        const bMinPrice = b.minPrice || Number.MAX_VALUE;
        return aMinPrice - bMinPrice;
      case "price_high":
        const aMaxPrice = a.maxPrice || 0;
        const bMaxPrice = b.maxPrice || 0;
        return bMaxPrice - aMaxPrice;
      case "popular":
        if (b.totalOrders !== a.totalOrders) return b.totalOrders - a.totalOrders;
        return b.viewCount - a.viewCount;
      case "orders":
        return b.totalOrders - a.totalOrders;
      case "views":
        return b.viewCount - a.viewCount;
      default:
        return b.createdAt - a.createdAt;
    }
  });
  
  // Apply pagination
  const total = results.length;
  const offset = args.offset || 0;
  const limit = args.limit || 50;
  
  const paginatedResults = results.slice(offset, offset + limit);
  
  return {
    products: paginatedResults,
    total,
    offset,
    limit,
    hasMore: offset + limit < total,
  };
};
