import { defineTable } from 'convex/server';
import { v } from 'convex/values';

export const chatwootHmacTokens = defineTable({
  userId: v.id('users'),
  organizationId: v.optional(v.id('organizations')),
  inbox: v.optional(v.union(v.literal('admin'), v.literal('platform'), v.literal('org'))),
  organizationSlug: v.optional(v.string()),
  hmacToken: v.string(),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index('by_user', ['userId'])
  .index('by_user_org_inbox', ['userId', 'organizationId', 'inbox']);

