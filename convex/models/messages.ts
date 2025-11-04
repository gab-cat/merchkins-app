import { defineTable } from "convex/server";
import { v } from "convex/values";

// Optimized messages with embedded user and organization info
export const messages = defineTable({
  organizationId: v.optional(v.id("organizations")),
  isArchived: v.boolean(),
  isRead: v.boolean(),
  isResolved: v.boolean(),
  isSentByCustomer: v.boolean(),
  isSentByAdmin: v.boolean(),
  repliesToId: v.optional(v.id("messages")),
  sentBy: v.optional(v.id("users")),
  
  // Embedded sender info
  senderInfo: v.optional(v.object({
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    email: v.string(),
    imageUrl: v.optional(v.string()),
    isStaff: v.boolean(),
    isAdmin: v.boolean(),
  })),
  
  // Embedded organization info
  organizationInfo: v.optional(v.object({
    name: v.string(),
    slug: v.string(),
    logo: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
  })),
  
  // Embedded reply context
  replyToInfo: v.optional(v.object({
    subject: v.string(),
    message: v.string(),
    senderName: v.string(),
    sentAt: v.number(),
  })),
  
  email: v.string(),
  subject: v.string(),
  message: v.string(),
  
  // Message metadata
  messageType: v.union(
    v.literal("INQUIRY"),
    v.literal("COMPLAINT"),
    v.literal("SUPPORT"),
    v.literal("FEEDBACK"),
    v.literal("REPLY")
  ),
  
  priority: v.union(
    v.literal("LOW"),
    v.literal("NORMAL"),
    v.literal("HIGH"),
    v.literal("URGENT")
  ),
  
  // Conversation tracking
  conversationId: v.optional(v.string()), // Group related messages
  threadDepth: v.number(), // How deep in the reply chain
  
  // File attachments
  attachments: v.optional(v.array(v.object({
    filename: v.string(),
    url: v.string(),
    size: v.number(),
    mimeType: v.string(),
  }))),
  
  // Response tracking
  responseTime: v.optional(v.number()), // Time to first response
  assignedTo: v.optional(v.id("users")),
  assigneeInfo: v.optional(v.object({
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    email: v.string(),
    imageUrl: v.optional(v.string()),
  })),
  
  // Tags for categorization
  tags: v.array(v.string()),
  
  // Auto-categorization score
  sentimentScore: v.optional(v.number()), // -1 to 1 (negative to positive)
  urgencyScore: v.optional(v.number()), // 0 to 1 (low to high urgency)
  
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_isArchived", ["isArchived"])
  .index("by_isRead", ["isRead"])
  .index("by_isResolved", ["isResolved"])
  .index("by_organization", ["organizationId"])
  .index("by_status", ["isRead", "isResolved", "isSentByCustomer", "isArchived"])
  .index("by_sender", ["sentBy"])
  .index("by_email", ["email"])
  .index("by_message_type", ["messageType"])
  .index("by_priority", ["priority"])
  .index("by_conversation", ["conversationId"])
  .index("by_assigned", ["assignedTo"])
  .index("by_organization_unread", ["organizationId", "isRead"])
  .index("by_organization_priority", ["organizationId", "priority"]);
