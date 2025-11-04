import { defineTable } from 'convex/server';
import { v } from 'convex/values';

// Simplified permissions - now mainly used as a reference/template
// Actual permissions are embedded in users and organizationMembers tables
export const permissions = defineTable({
  code: v.string(),
  name: v.string(),
  description: v.optional(v.string()),

  // Permission categorization
  category: v.union(
    v.literal('USER_MANAGEMENT'),
    v.literal('PRODUCT_MANAGEMENT'),
    v.literal('ORDER_MANAGEMENT'),
    v.literal('PAYMENT_MANAGEMENT'),
    v.literal('ORGANIZATION_MANAGEMENT'),
    v.literal('SYSTEM_ADMINISTRATION')
  ),

  // Default permission settings for new users/roles
  defaultSettings: v.object({
    canCreate: v.boolean(),
    canRead: v.boolean(),
    canUpdate: v.boolean(),
    canDelete: v.boolean(),
  }),

  // Permission metadata
  isActive: v.boolean(),
  isSystemPermission: v.boolean(), // Cannot be deleted
  requiredRole: v.optional(v.union(v.literal('ADMIN'), v.literal('STAFF'), v.literal('MEMBER'))),

  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index('by_code', ['code'])
  .index('by_category', ['category'])
  .index('by_active', ['isActive'])
  .index('by_system', ['isSystemPermission'])
  .index('by_required_role', ['requiredRole']);

// This table is now deprecated in favor of embedded permissions
// Keeping for backward compatibility and migration purposes
export const userPermissions = defineTable({
  userId: v.id('users'),
  permissionId: v.id('permissions'),

  // Embedded permission info for quick access
  permissionInfo: v.object({
    code: v.string(),
    name: v.string(),
    category: v.string(),
  }),

  // Embedded user info
  userInfo: v.object({
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    email: v.string(),
  }),

  canCreate: v.boolean(),
  canRead: v.boolean(),
  canUpdate: v.boolean(),
  canDelete: v.boolean(),

  // Deprecation tracking
  isDeprecated: v.boolean(),
  migratedAt: v.optional(v.number()),

  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index('by_user', ['userId'])
  .index('by_permission', ['permissionId'])
  .index('by_user_permission', ['userId', 'permissionId'])
  .index('by_deprecated', ['isDeprecated']);
