import { defineTable } from 'convex/server';
import { v } from 'convex/values';

// Optimized cart with embedded items for better performance
export const carts = defineTable({
  userId: v.id('users'),

  // Embedded user info to avoid joins
  userInfo: v.object({
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    email: v.string(),
    imageUrl: v.optional(v.string()),
  }),

  // Embedded cart items (for small to medium carts, <50 items)
  embeddedItems: v.array(
    v.object({
      // Variant identifier for the specific product variant (string id from product.variants)
      variantId: v.optional(v.string()),

      // Size selection for the variant (when variant has sizes)
      size: v.optional(
        v.object({
          id: v.string(),
          label: v.string(),
          price: v.optional(v.number()),
        })
      ),

      // Embedded product/variant info to avoid multiple joins
      productInfo: v.object({
        productId: v.id('products'),
        // Store/organization owning the product (optional for global products)
        organizationId: v.optional(v.id('organizations')),
        organizationName: v.optional(v.string()),
        title: v.string(),
        slug: v.string(),
        imageUrl: v.array(v.string()),
        variantName: v.optional(v.string()),
        price: v.number(),
        originalPrice: v.optional(v.number()),
        inventory: v.number(),
      }),

      quantity: v.number(),
      selected: v.boolean(),
      note: v.optional(v.string()),
      addedAt: v.number(),
    })
  ),

  // Cart metadata for quick access
  totalItems: v.number(),
  selectedItems: v.number(),
  totalValue: v.number(),
  selectedValue: v.number(),
  lastActivity: v.number(),

  // For abandoned cart recovery
  isAbandoned: v.boolean(),
  abandonedAt: v.optional(v.number()),

  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index('by_user', ['userId'])
  .index('by_last_activity', ['lastActivity'])
  .index('by_abandoned', ['isAbandoned'])
  .index('by_total_items', ['totalItems']);

// Separate cart items table only for very large carts (>50 items)
// Most users won't need this, but it's here for scalability
export const cartItems = defineTable({
  cartId: v.id('carts'),
  variantId: v.optional(v.string()), // For products with variants

  // Size selection for the variant (when variant has sizes)
  size: v.optional(
    v.object({
      id: v.string(),
      label: v.string(),
      price: v.optional(v.number()),
    })
  ),

  // Embedded product/variant info
  productInfo: v.object({
    productId: v.id('products'),
    organizationId: v.optional(v.id('organizations')),
    organizationName: v.optional(v.string()),
    title: v.string(),
    slug: v.string(),
    imageUrl: v.array(v.string()),
    variantName: v.optional(v.string()),
    price: v.number(),
    originalPrice: v.optional(v.number()),
    inventory: v.number(),
  }),

  quantity: v.number(),
  selected: v.boolean(),
  note: v.optional(v.string()),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index('by_cart', ['cartId'])
  .index('by_variant', ['variantId'])
  .index('by_cart_selected', ['cartId', 'selected']);
