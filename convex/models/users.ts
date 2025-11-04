import { defineTable } from 'convex/server';
import { v } from 'convex/values';

// Optimized users with embedded permissions and manager info
export const users = defineTable({
  isDeleted: v.boolean(),
  clerkId: v.string(),
  isOnboarded: v.boolean(),
  firstName: v.optional(v.string()),
  lastName: v.optional(v.string()),
  managerId: v.optional(v.id('users')),

  // Embedded manager info when applicable
  managerInfo: v.optional(
    v.object({
      firstName: v.optional(v.string()),
      lastName: v.optional(v.string()),
      email: v.string(),
      imageUrl: v.optional(v.string()),
    })
  ),

  imageUrl: v.optional(v.string()),
  email: v.string(),
  phone: v.string(),
  isStaff: v.boolean(),
  isAdmin: v.boolean(),
  isSetupDone: v.boolean(),
  isMerchant: v.boolean(),
  cartId: v.optional(v.id('carts')),

  // Embedded permissions for quick access
  permissions: v.optional(
    v.array(
      v.object({
        permissionCode: v.string(),
        canCreate: v.boolean(),
        canRead: v.boolean(),
        canUpdate: v.boolean(),
        canDelete: v.boolean(),
      })
    )
  ),

  // User activity metrics
  totalOrders: v.optional(v.number()),
  totalSpent: v.optional(v.number()),
  reviewCount: v.optional(v.number()),
  lastLoginAt: v.optional(v.number()),
  lastOrderAt: v.optional(v.number()),

  // Organization memberships for quick access
  organizationMemberships: v.optional(
    v.array(
      v.object({
        organizationId: v.id('organizations'),
        organizationName: v.string(),
        organizationSlug: v.string(),
        role: v.string(),
        isActive: v.boolean(),
        joinedAt: v.number(),
      })
    )
  ),

  // User preferences
  preferences: v.optional(
    v.object({
      notifications: v.object({
        email: v.boolean(),
        push: v.boolean(),
        orderUpdates: v.boolean(),
        promotions: v.boolean(),
      }),
      privacy: v.object({
        profileVisibility: v.union(v.literal('PUBLIC'), v.literal('PRIVATE')),
        showActivity: v.boolean(),
      }),
    })
  ),

  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index('by_email', ['email'])
  .index('by_clerkId', ['clerkId'])
  .index('by_isMerchant', ['isMerchant'])
  .index('by_isStaff', ['isStaff'])
  .index('by_isAdmin', ['isAdmin'])
  .index('by_manager', ['managerId'])
  .index('by_last_login', ['lastLoginAt'])
  .index('by_total_orders', ['totalOrders'])
  .index('by_total_spent', ['totalSpent']);
