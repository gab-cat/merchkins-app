import { defineTable } from "convex/server";
import { v } from "convex/values";

// File storage table for tracking uploaded files
export const files = defineTable({
  // File metadata
  fileName: v.string(),
  originalName: v.string(),
  fileType: v.string(), // 'image', 'document', 'video', 'audio', etc.
  mimeType: v.string(),
  fileSize: v.number(), // in bytes
  
  // Storage info
  storageId: v.id("_storage"), // Convex storage ID
  url: v.string(), // Public URL to access the file
  
  // Organization and user context
  uploadedById: v.id("users"),
  organizationId: v.optional(v.id("organizations")),
  
  // Usage tracking
  usageType: v.string(), // 'product_image', 'variant_image', 'profile_image', 'document', etc.
  relatedEntityId: v.optional(v.string()), // ID of the entity this file belongs to
  relatedEntityType: v.optional(v.string()), // 'product', 'variant', 'user', 'organization', etc.
  
  // File status
  isActive: v.boolean(),
  isPublic: v.boolean(),
  
  // Security and validation
  checksum: v.optional(v.string()), // File checksum for integrity
  isVerified: v.boolean(), // Whether file has been scanned/verified
  
  // Metadata for images
  imageMetadata: v.optional(v.object({
    width: v.number(),
    height: v.number(),
    format: v.string(), // 'jpg', 'png', 'webp', etc.
    hasTransparency: v.optional(v.boolean()),
  })),
  
  // Access control
  accessLevel: v.union(
    v.literal("public"),
    v.literal("organization"),
    v.literal("private")
  ),
  
  // Timestamps
  createdAt: v.number(),
  updatedAt: v.number(),
  lastAccessedAt: v.optional(v.number()),
  
  // Expiry (for temporary files)
  expiresAt: v.optional(v.number()),
})
  .index("by_storage_id", ["storageId"])
  .index("by_uploader", ["uploadedById"])
  .index("by_organization", ["organizationId"])
  .index("by_usage_type", ["usageType"])
  .index("by_related_entity", ["relatedEntityType", "relatedEntityId"])
  .index("by_file_type", ["fileType"])
  .index("by_active", ["isActive"])
  .index("by_public", ["isPublic"])
  .index("by_access_level", ["accessLevel"])
  .index("by_expires", ["expiresAt"]);
