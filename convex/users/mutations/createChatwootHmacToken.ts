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

