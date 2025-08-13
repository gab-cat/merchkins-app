import { defineTable } from "convex/server";
import { v } from "convex/values";

// Optimized categories with embedded organization info and metrics
export const categories = defineTable({
  isDeleted: v.boolean(),
  organizationId: v.optional(v.id("organizations")),
  
  // Embedded organization info
  organizationInfo: v.optional(v.object({
    name: v.string(),
    slug: v.string(),
    logo: v.optional(v.string()),
  })),
  
  name: v.string(),
  description: v.optional(v.string()),
  
  // Category hierarchy
  parentCategoryId: v.optional(v.id("categories")),
  parentCategoryName: v.optional(v.string()),
  level: v.number(), // 0 for root categories, 1 for subcategories, etc.
  
  // Category metadata
  slug: v.string(),
  imageUrl: v.optional(v.string()),
  iconUrl: v.optional(v.string()),
  color: v.optional(v.string()), // Hex color for UI theming
  
  // Category metrics
  productCount: v.number(),
  activeProductCount: v.number(),
  totalOrderCount: v.number(),
  totalRevenue: v.number(),
  
  // Display settings
  isActive: v.boolean(),
  isFeatured: v.boolean(),
  displayOrder: v.number(),
  
  // SEO and marketing
  seoTitle: v.optional(v.string()),
  seoDescription: v.optional(v.string()),
  tags: v.array(v.string()),
  
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_name", ["name"])
  .index("by_organization", ["organizationId"])
  .index("by_slug", ["slug"])
  .index("by_parent", ["parentCategoryId"])
  .index("by_level", ["level"])
  .index("by_active", ["isActive"])
  .index("by_featured", ["isFeatured"])
  .index("by_display_order", ["displayOrder"])
  .index("by_organization_active", ["organizationId", "isActive"])
  .index("by_organization_level", ["organizationId", "level"])
  .index("by_product_count", ["productCount"]);
