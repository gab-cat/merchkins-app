import { defineTable } from 'convex/server';
import { v } from 'convex/values';

// Optimized announcements with embedded publisher and organization info
export const announcements = defineTable({
  organizationId: v.optional(v.id('organizations')),
  title: v.string(),
  type: v.union(v.literal('NORMAL'), v.literal('SYSTEM')),
  level: v.union(v.literal('INFO'), v.literal('WARNING'), v.literal('CRITICAL')),
  publishedById: v.id('users'),

  // Optional categorization (only settable by org-admin or super-admin)
  category: v.optional(v.string()),

  // Visibility within scope (optional for backward compatibility)
  // - For global announcements (no organizationId), default PUBLIC
  // - For organization announcements, default INTERNAL unless explicitly PUBLIC
  visibility: v.optional(v.union(v.literal('PUBLIC'), v.literal('INTERNAL'))),

  // Embedded publisher info
  publisherInfo: v.object({
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    email: v.string(),
    imageUrl: v.optional(v.string()),
    isAdmin: v.boolean(),
  }),

  // Embedded organization info
  organizationInfo: v.optional(
    v.object({
      name: v.string(),
      slug: v.string(),
      logo: v.optional(v.string()),
      logoUrl: v.optional(v.string()),
    })
  ),

  content: v.string(),

  // Rich content support
  contentType: v.union(v.literal('TEXT'), v.literal('MARKDOWN'), v.literal('HTML')),

  // Targeting and visibility
  targetAudience: v.union(v.literal('ALL'), v.literal('STAFF'), v.literal('CUSTOMERS'), v.literal('MERCHANTS'), v.literal('ADMINS')),

  // Scheduling
  publishedAt: v.number(),
  scheduledAt: v.optional(v.number()),
  expiresAt: v.optional(v.number()),

  // Engagement tracking
  viewCount: v.number(),
  acknowledgedBy: v.array(
    v.object({
      userId: v.id('users'),
      userName: v.string(),
      acknowledgedAt: v.number(),
    })
  ),

  // Announcement metadata
  isActive: v.boolean(),
  isPinned: v.boolean(),
  requiresAcknowledgment: v.boolean(),

  // File attachments
  attachments: v.optional(
    v.array(
      v.object({
        filename: v.string(),
        url: v.string(),
        size: v.number(),
        mimeType: v.string(),
      })
    )
  ),

  // Analytics
  clickCount: v.number(),
  dismissCount: v.number(),

  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index('by_organization', ['organizationId'])
  .index('by_publisher', ['publishedById'])
  .index('by_type', ['type'])
  .index('by_level', ['level'])
  .index('by_target_audience', ['targetAudience'])
  .index('by_active', ['isActive'])
  .index('by_pinned', ['isPinned'])
  .index('by_category', ['category'])
  .index('by_visibility', ['visibility'])
  .index('by_organization_visibility', ['organizationId', 'visibility'])
  .index('by_published_at', ['publishedAt'])
  .index('by_expires_at', ['expiresAt'])
  .index('by_organization_active', ['organizationId', 'isActive'])
  .index('by_organization_level', ['organizationId', 'level'])
  .index('by_view_count', ['viewCount']);
