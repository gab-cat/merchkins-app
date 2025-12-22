import { MutationCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';

export const createChatwootHmacTokenArgs = {
  userId: v.id('users'),
  organizationId: v.optional(v.id('organizations')),
  inbox: v.optional(v.union(v.literal('admin'), v.literal('platform'), v.literal('org'))),
  organizationSlug: v.optional(v.string()),
  hmacToken: v.string(),
};

export const createChatwootHmacTokenHandler = async (
  ctx: MutationCtx,
  args: {
    userId: Id<'users'>;
    organizationId?: Id<'organizations'>;
    inbox?: 'admin' | 'platform' | 'org';
    organizationSlug?: string;
    hmacToken: string;
  }
) => {
  // Check if a token already exists for this user/org/inbox combination
  // This prevents duplicates in case the mutation is called directly
  // Use the same logic as the query handler
  const allTokens = await ctx.db
    .query('chatwootHmacTokens')
    .withIndex('by_user', (q) => q.eq('userId', args.userId))
    .collect();

  // Filter to find exact match (handles undefined values properly)
  const existingToken = allTokens.find((t) => {
    // Match organizationId: both undefined or both equal
    const orgMatch =
      (args.organizationId === undefined && t.organizationId === undefined) ||
      (args.organizationId !== undefined && t.organizationId === args.organizationId);
    
    // Match inbox: both undefined or both equal
    const inboxMatch =
      (args.inbox === undefined && t.inbox === undefined) ||
      (args.inbox !== undefined && t.inbox === args.inbox);
    
    return orgMatch && inboxMatch;
  });

  if (existingToken) {
    // Token already exists, return the existing token's ID
    console.log('Chatwoot HMAC token already exists, skipping creation');
    return existingToken._id;
  }

  const now = Date.now();

  // Create the token record
  const tokenId = await ctx.db.insert('chatwootHmacTokens', {
    userId: args.userId,
    organizationId: args.organizationId,
    inbox: args.inbox,
    organizationSlug: args.organizationSlug,
    hmacToken: args.hmacToken,
    createdAt: now,
    updatedAt: now,
  });

  return tokenId;
};

