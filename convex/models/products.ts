import { defineTable } from "convex/server";
import { v } from "convex/values";

// Optimized products with embedded category, creator info, and variants
export const products = defineTable({
  isDeleted: v.boolean(),
  categoryId: v.optional(v.id("categories")),
  postedById: v.id("users"),
  organizationId: v.optional(v.id("organizations")),
  
  // Embedded category info
  categoryInfo: v.optional(v.object({
    name: v.string(),
    description: v.optional(v.string()),
  })),
  
  // Embedded creator info
  creatorInfo: v.object({
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    email: v.string(),
    imageUrl: v.optional(v.string()),
  }),
  
  // Embedded organization info
  organizationInfo: v.optional(v.object({
    name: v.string(),
    slug: v.string(),
    logo: v.optional(v.string()),
  })),
  
  slug: v.string(),
  title: v.string(),
  isActive: v.boolean(),
  description: v.optional(v.string()),
  discountLabel: v.optional(v.string()),
  supposedPrice: v.optional(v.number()),
  rating: v.number(),
  reviewsCount: v.number(),
  imageUrl: v.array(v.string()),
  tags: v.array(v.string()),
  isBestPrice: v.boolean(),
  inventory: v.number(),
  inventoryType: v.union(v.literal("PREORDER"), v.literal("STOCK")),
  
  // Embedded variants
  variants: v.array(v.object({
    isActive: v.boolean(),
    variantId: v.string(), // Unique identifier for the variant
    variantName: v.string(),
    price: v.number(),
    inventory: v.number(),
    imageUrl: v.optional(v.string()),
    
    // Variant metrics
    orderCount: v.number(),
    inCartCount: v.number(),
    isPopular: v.boolean(),
    
    createdAt: v.number(),
    updatedAt: v.number(),
  })),
  
  // Embedded recent reviews for quick display (last 3-5 reviews)
  recentReviews: v.array(v.object({
    reviewId: v.id("reviews"),
    userId: v.id("users"),
    userName: v.string(),
    userImage: v.optional(v.string()),
    rating: v.number(),
    comment: v.optional(v.string()),
    createdAt: v.number(),
  })),
  
  // Product metrics
  totalVariants: v.number(),
  minPrice: v.optional(v.number()),
  maxPrice: v.optional(v.number()),
  totalOrders: v.number(),
  viewCount: v.number(),
  
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_slug", ["slug"])
  .index("by_isDeleted", ["isDeleted"])
  .index("by_organization", ["organizationId"])
  .index("by_category", ["categoryId"])
  .index("by_creator", ["postedById"])
  .index("by_rating", ["rating"])
  .index("by_organization_category", ["organizationId", "categoryId"])
  .index("by_tags", ["tags"])
  .index("by_inventory_type", ["inventoryType"])
  .index("by_best_price", ["isBestPrice"])
  .index("by_view_count", ["viewCount"]);

// Enhanced reviews with embedded user and product info
export const reviews = defineTable({
  productId: v.id("products"),
  userId: v.id("users"),
  
  // Embedded user info
  userInfo: v.object({
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    email: v.string(),
    imageUrl: v.optional(v.string()),
    courses: v.string(),
  }),
  
  // Embedded product info for context
  productInfo: v.object({
    title: v.string(),
    slug: v.string(),
    imageUrl: v.array(v.string()),
    organizationId: v.optional(v.id("organizations")),
    organizationName: v.optional(v.string()),
  }),
  
  rating: v.number(),
  comment: v.optional(v.string()),
  
  // Review metadata
  isVerifiedPurchase: v.boolean(),
  orderId: v.optional(v.id("orders")),
  helpfulCount: v.number(),
  reportCount: v.number(),
  isModerated: v.boolean(),
  
  // Review responses/interactions
  merchantResponse: v.optional(v.object({
    message: v.string(),
    respondedAt: v.number(),
    respondedBy: v.id("users"),
    responderName: v.string(),
  })),
  
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_product", ["productId"])
  .index("by_user", ["userId"])
  .index("by_rating", ["rating"])
  .index("by_product_rating", ["productId", "rating"])
  .index("by_verified", ["isVerifiedPurchase"])
  .index("by_helpful", ["helpfulCount"])
  .index("by_moderated", ["isModerated"]);
