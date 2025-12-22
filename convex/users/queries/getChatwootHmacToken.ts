import { QueryCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { requireAuthentication } from '../../helpers';
import { Id } from '../../_generated/dataModel';

export const getChatwootHmacTokenArgs = {
  userId: v.id('users'),
  organizationId: v.optional(v.id('organizations')),
  inbox: v.optional(v.union(v.literal('admin'), v.literal('platform'), v.literal('org'))),
};

export const getChatwootHmacTokenHandler = async (
  ctx: QueryCtx,
  args: {
    userId: Id<'users'>;
    organizationId?: Id<'organizations'>;
    inbox?: 'admin' | 'platform' | 'org';
  }
) => {
  // Require authentication
  await requireAuthentication(ctx);

  // Query for existing token
  // Use the by_user index to get all tokens for this user, then filter for exact match
  // This handles optional fields (organizationId, inbox) properly
  const allTokens = await ctx.db
    .query('chatwootHmacTokens')
    .withIndex('by_user', (q) => q.eq('userId', args.userId))
    .collect();

  // Filter to find exact match (handles undefined values properly)
  const token = allTokens.find((t) => {
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

  if (!token) {
    return null;
  }

  return {
    _id: token._id,
    hmacToken: token.hmacToken,
    organizationSlug: token.organizationSlug,
  };
};

