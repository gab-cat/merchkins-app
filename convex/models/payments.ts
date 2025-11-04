import { defineTable } from "convex/server";
import { v } from "convex/values";

// Optimized payments with embedded order and user info
export const payments = defineTable({
  isDeleted: v.boolean(),
  organizationId: v.optional(v.id("organizations")),
  orderId: v.id("orders"),
  userId: v.id("users"),
  processedById: v.optional(v.id("users")),
  
  // Embedded order info for context
  orderInfo: v.object({
    orderNumber: v.optional(v.string()),
    customerName: v.string(),
    customerEmail: v.string(),
    totalAmount: v.number(),
    orderDate: v.number(),
    status: v.string(),
  }),
  
  // Embedded user info
  userInfo: v.object({
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    email: v.string(),
    phone: v.string(),
    imageUrl: v.optional(v.string()),
  }),
  
  // Embedded processor info
  processorInfo: v.optional(v.object({
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    email: v.string(),
    imageUrl: v.optional(v.string()),
  })),
  
  // Embedded organization info
  organizationInfo: v.optional(v.object({
    name: v.string(),
    slug: v.string(),
    logo: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
  })),
  
  paymentDate: v.number(),
  amount: v.number(),
  paymentMethod: v.literal("XENDIT"),
  paymentSite: v.union(v.literal("ONSITE"), v.literal("OFFSITE")),
  paymentStatus: v.union(
    v.literal("VERIFIED"),
    v.literal("PENDING"),
    v.literal("DECLINED"),
    v.literal("PROCESSING"),
    v.literal("FAILED"),
    v.literal("REFUND_PENDING"),
    v.literal("REFUNDED"),
    v.literal("CANCELLED")
  ),
  referenceNo: v.string(),
  memo: v.optional(v.string()),
  currency: v.string(),
  transactionId: v.optional(v.string()),
  paymentProvider: v.optional(v.string()),
  xenditInvoiceId: v.optional(v.string()),
  xenditInvoiceUrl: v.optional(v.string()),
  xenditInvoiceExpiryDate: v.optional(v.number()),
  metadata: v.optional(v.any()),
  
  // Payment tracking
  verificationDate: v.optional(v.number()),
  reconciliationStatus: v.union(
    v.literal("PENDING"),
    v.literal("MATCHED"),
    v.literal("DISCREPANCY"),
    v.literal("MANUAL_REVIEW")
  ),
  
  // Fee information
  processingFee: v.optional(v.number()),
  netAmount: v.optional(v.number()),
  
  // Status history for audit trail
  statusHistory: v.array(v.object({
    status: v.string(),
    changedBy: v.optional(v.id("users")),
    changedByName: v.optional(v.string()),
    reason: v.optional(v.string()),
    changedAt: v.number(),
  })),
  
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_order", ["orderId"])
  .index("by_user", ["userId"])
  .index("by_processedBy", ["processedById"])
  .index("by_isDeleted", ["isDeleted"])
  .index("by_organization", ["organizationId"])
  .index("by_payment_status", ["paymentStatus"])
  .index("by_payment_method", ["paymentMethod"])
  .index("by_payment_date", ["paymentDate"])
  .index("by_amount", ["amount"])
  .index("by_reference", ["referenceNo"])
  .index("by_reconciliation", ["reconciliationStatus"])
  .index("by_organization_status", ["organizationId", "paymentStatus"])
  .index("by_user_status", ["userId", "paymentStatus"]);
