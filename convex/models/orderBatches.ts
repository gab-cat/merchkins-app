import { defineTable } from 'convex/server';
import { v } from 'convex/values';

export const orderBatches = defineTable({
  organizationId: v.id('organizations'),
  name: v.string(), // e.g., "December Week 1"
  description: v.optional(v.string()),
  startDate: v.number(), // Timestamp - start of date range
  endDate: v.number(), // Timestamp - end of date range
  isActive: v.boolean(), // For toggling visibility
  isDeleted: v.boolean(), // Soft delete
  createdById: v.id('users'),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index('by_organization', ['organizationId'])
  .index('by_organization_active', ['organizationId', 'isActive'])
  .index('by_date_range', ['organizationId', 'startDate', 'endDate']);
