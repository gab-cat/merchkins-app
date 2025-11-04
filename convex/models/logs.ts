import { defineTable } from "convex/server";
import { v } from "convex/values";

// Optimized logs with embedded user and organization info
export const logs = defineTable({
  organizationId: v.optional(v.id("organizations")),
  userId: v.optional(v.id("users")),
  createdById: v.optional(v.id("users")),
  
  // Embedded user info (subject of the log)
  userInfo: v.optional(v.object({
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    email: v.string(),
    imageUrl: v.optional(v.string()),
  })),
  
  // Embedded creator info (who triggered the log)
  creatorInfo: v.optional(v.object({
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
  
  createdDate: v.number(),
  reason: v.string(),
  systemText: v.string(),
  userText: v.string(),
  
  // Enhanced log categorization
  logType: v.union(
    v.literal("USER_ACTION"),
    v.literal("SYSTEM_EVENT"),
    v.literal("SECURITY_EVENT"),
    v.literal("DATA_CHANGE"),
    v.literal("ERROR_EVENT"),
    v.literal("AUDIT_TRAIL")
  ),
  
  severity: v.union(
    v.literal("LOW"),
    v.literal("MEDIUM"),
    v.literal("HIGH"),
    v.literal("CRITICAL")
  ),
  
  // Context information
  resourceType: v.optional(v.string()), // e.g., "order", "product", "user"
  resourceId: v.optional(v.string()),
  action: v.optional(v.string()), // e.g., "create", "update", "delete", "login"
  
  // Additional metadata
  metadata: v.optional(v.any()), // JSON object for additional context
  ipAddress: v.optional(v.string()),
  userAgent: v.optional(v.string()),
  
  // Change tracking
  previousValue: v.optional(v.any()),
  newValue: v.optional(v.any()),
  
  // Correlation
  correlationId: v.optional(v.string()), // Group related log entries
  sessionId: v.optional(v.string()),
  
  // Retention and archival
  isArchived: v.boolean(),
  archivedAt: v.optional(v.number()),
})
  .index("by_user", ["userId"])
  .index("by_creator", ["createdById"])
  .index("by_organization", ["organizationId"])
  .index("by_created_date", ["createdDate"])
  .index("by_log_type", ["logType"])
  .index("by_severity", ["severity"])
  .index("by_resource", ["resourceType", "resourceId"])
  .index("by_action", ["action"])
  .index("by_correlation", ["correlationId"])
  .index("by_session", ["sessionId"])
  .index("by_archived", ["isArchived"])
  .index("by_organization_type", ["organizationId", "logType"])
  .index("by_user_action", ["userId", "action"]);
