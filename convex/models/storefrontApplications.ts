import { defineTable } from 'convex/server';
import { v } from 'convex/values';

export const storefrontApplications = defineTable({
  // Business Information
  businessName: v.string(),
  contactName: v.string(),
  email: v.string(),
  phone: v.string(),
  description: v.optional(v.string()),

  // Application Status
  status: v.union(v.literal('PENDING'), v.literal('APPROVED'), v.literal('REJECTED')),

  // Review Information
  reviewedById: v.optional(v.id('users')),
  notes: v.optional(v.string()),
  reviewedAt: v.optional(v.number()),

  // Timestamps
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index('by_status', ['status'])
  .index('by_email', ['email'])
  .index('by_createdAt', ['createdAt']);
