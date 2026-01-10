import { defineTable } from 'convex/server';
import { v } from 'convex/values';

export const organizations = defineTable({
  isDeleted: v.boolean(),
  name: v.string(),
  slug: v.string(),
  description: v.optional(v.string()),
  logo: v.optional(v.string()),
  logoUrl: v.optional(v.string()),
  bannerImage: v.optional(v.string()),
  bannerImageUrl: v.optional(v.string()),
  themeSettings: v.optional(
    v.object({
      // Brand Colors
      primaryColor: v.string(), // Main brand color (hex)
      secondaryColor: v.optional(v.string()), // Secondary brand color
      // Header/Footer specific colors
      headerBackgroundColor: v.optional(v.string()),
      headerForegroundColor: v.optional(v.string()),
      headerTitleColor: v.optional(v.string()),
      footerBackgroundColor: v.optional(v.string()),
      footerForegroundColor: v.optional(v.string()),

      // Theme Mode
      mode: v.optional(v.union(v.literal('light'), v.literal('dark'), v.literal('auto'))),

      // Typography
      fontFamily: v.optional(v.string()), // Primary font family

      // Layout
      borderRadius: v.optional(v.union(v.literal('none'), v.literal('small'), v.literal('medium'), v.literal('large'))),
    })
  ),
  website: v.optional(v.string()),
  industry: v.optional(v.string()),
  size: v.optional(v.string()),
  organizationType: v.union(v.literal('PUBLIC'), v.literal('PRIVATE'), v.literal('SECRET')),

  // Organization metrics for quick access
  memberCount: v.number(),
  adminCount: v.number(),
  activeProductCount: v.number(),
  totalOrderCount: v.number(),

  // Payout settings
  platformFeePercentage: v.optional(v.number()), // Default is 15% if not set
  payoutBankDetails: v.optional(
    v.object({
      bankName: v.string(),
      accountName: v.string(),
      accountNumber: v.string(),
      bankCode: v.optional(v.string()), // For automated payouts in the future
      notificationEmail: v.optional(v.string()), // Email to receive payout notifications
    })
  ),

  // Chatwoot integration settings
  chatwootWebsiteToken: v.optional(v.string()),
  chatwootIdentityToken: v.optional(v.string()),
  // Agent Bot settings for automated responses
  chatwootAgentBotId: v.optional(v.number()),
  chatwootAgentBotToken: v.optional(v.string()),
  chatwootAccountId: v.optional(v.number()),

  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index('by_slug', ['slug'])
  .index('by_name', ['name'])
  .index('by_isDeleted', ['isDeleted'])
  .index('by_organizationType', ['organizationType'])
  .index('by_member_count', ['memberCount'])
  .searchIndex('search_organizations', {
    searchField: 'name',
    filterFields: ['isDeleted', 'organizationType'],
  });

// Optimized organization members with embedded user info
export const organizationMembers = defineTable({
  userId: v.id('users'),
  organizationId: v.id('organizations'),

  // Embedded user info to avoid joins
  userInfo: v.object({
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    email: v.string(),
    phone: v.string(),
    imageUrl: v.optional(v.string()),
    isStaff: v.boolean(),
  }),

  // Embedded organization info
  organizationInfo: v.object({
    name: v.string(),
    slug: v.string(),
    logo: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    organizationType: v.string(),
  }),

  role: v.union(v.literal('ADMIN'), v.literal('STAFF'), v.literal('MEMBER')),
  isActive: v.boolean(),
  joinedAt: v.number(),
  lastActiveAt: v.optional(v.number()),

  // Embedded permissions for quick access
  permissions: v.array(
    v.object({
      permissionCode: v.string(),
      canCreate: v.boolean(),
      canRead: v.boolean(),
      canUpdate: v.boolean(),
      canDelete: v.boolean(),
    })
  ),

  // Activity metrics
  orderCount: v.number(),
  messageCount: v.number(),
  lastOrderAt: v.optional(v.number()),

  updatedAt: v.number(),
})
  .index('by_user', ['userId'])
  .index('by_organization', ['organizationId'])
  .index('by_role', ['role'])
  .index('by_user_organization', ['userId', 'organizationId'])
  .index('by_active', ['isActive'])
  .index('by_organization_active', ['organizationId', 'isActive'])
  .index('by_organization_role', ['organizationId', 'role'])
  .index('by_last_active', ['lastActiveAt']);

// Optimized invite links with embedded creator info
export const organizationInviteLinks = defineTable({
  organizationId: v.id('organizations'),
  code: v.string(),
  createdById: v.id('users'),

  // Embedded creator info
  creatorInfo: v.object({
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    email: v.string(),
    imageUrl: v.optional(v.string()),
  }),

  // Embedded organization info
  organizationInfo: v.object({
    name: v.string(),
    slug: v.string(),
    logo: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
  }),

  expiresAt: v.optional(v.number()),
  isActive: v.boolean(),
  usageLimit: v.optional(v.number()),
  usedCount: v.number(),

  // Track who used the invite
  usedBy: v.array(
    v.object({
      userId: v.id('users'),
      userEmail: v.string(),
      userName: v.string(),
      usedAt: v.number(),
    })
  ),

  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index('by_organization', ['organizationId'])
  .index('by_code', ['code'])
  .index('by_creator', ['createdById'])
  .index('by_isActive', ['isActive'])
  .index('by_expires', ['expiresAt'])
  .index('by_organization_active', ['organizationId', 'isActive']);

// Simplified permissions - embedded in organizationMembers
export const organizationPermissions = defineTable({
  memberId: v.id('organizationMembers'),
  permissionCode: v.string(),
  canCreate: v.boolean(),
  canRead: v.boolean(),
  canUpdate: v.boolean(),
  canDelete: v.boolean(),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index('by_member', ['memberId'])
  .index('by_permissionCode', ['permissionCode']);

// Join requests for private organizations
export const organizationJoinRequests = defineTable({
  organizationId: v.id('organizations'),
  userId: v.id('users'),
  status: v.union(v.literal('PENDING'), v.literal('APPROVED'), v.literal('REJECTED')),
  note: v.optional(v.string()),
  reviewedById: v.optional(v.id('users')),
  createdAt: v.number(),
  reviewedAt: v.optional(v.number()),
  updatedAt: v.number(),
})
  .index('by_user_organization', ['userId', 'organizationId'])
  .index('by_organization_status', ['organizationId', 'status'])
  .index('by_status', ['status']);
