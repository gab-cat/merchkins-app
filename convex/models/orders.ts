import { defineTable } from "convex/server";
import { v } from "convex/values";

// Optimized orders with embedded customer and processor info
export const orders = defineTable({
  isDeleted: v.boolean(),
  organizationId: v.optional(v.id("organizations")),
  customerId: v.id("users"),
  processedById: v.optional(v.id("users")),
  
  // Embedded customer info to avoid joins
  customerInfo: v.object({
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    email: v.string(),
    phone: v.string(),
    imageUrl: v.optional(v.string()),
  }),
  
  // Embedded processor info (when assigned)
  processorInfo: v.optional(v.object({
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    email: v.string(),
    imageUrl: v.optional(v.string()),
  })),
  
  // Embedded organization info for quick access
  organizationInfo: v.optional(v.object({
    name: v.string(),
    slug: v.string(),
    logo: v.optional(v.string()),
  })),
  
  orderDate: v.number(),
  orderNumber: v.optional(v.string()),
  status: v.union(
    v.literal("PENDING"),
    v.literal("PROCESSING"),
    v.literal("READY"),
    v.literal("DELIVERED"),
    v.literal("CANCELLED")
  ),
  paymentStatus: v.union(
    v.literal("PENDING"),
    v.literal("DOWNPAYMENT"),
    v.literal("PAID"),
    v.literal("REFUNDED")
  ),
  cancellationReason: v.optional(v.union(
    v.literal("OUT_OF_STOCK"),
    v.literal("CUSTOMER_REQUEST"),
    v.literal("PAYMENT_FAILED"),
    v.literal("OTHERS")
  )),
  
  // Embedded order items for small orders (<20 items)
  embeddedItems: v.optional(v.array(v.object({
    variantId: v.optional(v.string()),
    
    // Embedded product info
    productInfo: v.object({
      productId: v.id("products"),
      title: v.string(),
      slug: v.string(),
      imageUrl: v.array(v.string()),
      variantName: v.optional(v.string()),
      categoryName: v.optional(v.string()),
    }),
    
    quantity: v.number(),
    price: v.number(),
    originalPrice: v.number(),
    appliedRole: v.string(),
    customerNote: v.optional(v.string()),
  }))),
  
  // Order summary for quick access
  totalAmount: v.number(),
  discountAmount: v.number(),
  itemCount: v.number(),
  uniqueProductCount: v.number(),
  
  estimatedDelivery: v.optional(v.number()),
  customerSatisfactionSurveyId: v.optional(v.id("surveyResponses")),
  customerNotes: v.optional(v.string()),
  paymentPreference: v.optional(v.union(v.literal("FULL"), v.literal("DOWNPAYMENT"))),

  // Xendit payment integration
  xenditInvoiceId: v.optional(v.string()),
  xenditInvoiceUrl: v.optional(v.string()),
  xenditInvoiceExpiryDate: v.optional(v.number()),
  xenditInvoiceCreatedAt: v.optional(v.number()),
  
  // Embedded status history for quick access (last 5 changes)
  recentStatusHistory: v.array(v.object({
    status: v.string(),
    changedBy: v.id("users"),
    changedByName: v.string(),
    reason: v.optional(v.string()),
    changedAt: v.number(),
  })),
  
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_customer", ["customerId"])
  .index("by_processedBy", ["processedById"])
  .index("by_status", ["status"])
  .index("by_isDeleted", ["isDeleted"])
  .index("by_organization", ["organizationId"])
  .index("by_payment_status", ["paymentStatus"])
  .index("by_customer_status", ["customerId", "status"])
  .index("by_organization_status", ["organizationId", "status"])
  .index("by_order_date", ["orderDate"])
  .index("by_estimated_delivery", ["estimatedDelivery"]);

// Separate order items table for large orders (>20 items)
export const orderItems = defineTable({
  orderId: v.id("orders"),
  variantId: v.optional(v.string()),
  
  // Embedded product info to reduce joins
  productInfo: v.object({
    productId: v.id("products"),
    title: v.string(),
    slug: v.string(),
    imageUrl: v.array(v.string()),
    variantName: v.optional(v.string()),
    categoryName: v.optional(v.string()),
  }),
  
  quantity: v.number(),
  price: v.number(),
  originalPrice: v.number(),
  appliedRole: v.string(),
  customerNote: v.optional(v.string()),
  size: v.optional(v.union(
    v.literal("XS"),
    v.literal("S"),
    v.literal("M"),
    v.literal("L"),
    v.literal("XL"),
    v.literal("XXL")
  )),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_order", ["orderId"])
  .index("by_variant", ["variantId"])
  .index("by_product", ["productInfo.productId"]);

// Enhanced order logs with embedded user info
export const orderLogs = defineTable({
  createdById: v.id("users"),
  orderId: v.id("orders"),
  
  // Embedded creator info
  creatorInfo: v.object({
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    email: v.string(),
    imageUrl: v.optional(v.string()),
  }),
  
  // Embedded order info for context
  orderInfo: v.object({
    orderNumber: v.optional(v.string()),
    customerName: v.string(),
    status: v.string(),
    totalAmount: v.number(),
  }),
  
  reason: v.string(),
  message: v.optional(v.string()),
  userMessage: v.optional(v.string()),
  logType: v.union(
    v.literal("STATUS_CHANGE"),
    v.literal("PAYMENT_UPDATE"),
    v.literal("ITEM_MODIFICATION"),
    v.literal("NOTE_ADDED"),
    v.literal("SYSTEM_UPDATE")
  ),
  
  // Previous and new values for change tracking
  previousValue: v.optional(v.string()),
  newValue: v.optional(v.string()),
  
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_order", ["orderId"])
  .index("by_creator", ["createdById"])
  .index("by_log_type", ["logType"])
  .index("by_order_type", ["orderId", "logType"]);
