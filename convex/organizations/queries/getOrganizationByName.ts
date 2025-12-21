'use server';

import { QueryCtx } from '../../_generated/server';
import { v } from 'convex/values';

/**
 * Get organization by name using the by_name index.
 * Returns the organization if found, null otherwise.
 */
export const getOrganizationByNameArgs = {
  name: v.string(),
};

export const getOrganizationByNameReturns = v.union(
  v.object({
    _id: v.id('organizations'),
    name: v.string(),
    slug: v.string(),
    chatwootAgentBotId: v.optional(v.number()),
    chatwootAgentBotToken: v.optional(v.string()),
    chatwootAccountId: v.optional(v.number()),
    chatwootWebsiteToken: v.optional(v.string()),
    chatwootIdentityToken: v.optional(v.string()),
  }),
  v.null()
);

export const getOrganizationByNameHandler = async (
  ctx: QueryCtx,
  args: {
    name: string;
  }
) => {
  const organization = await ctx.db
    .query('organizations')
    .withIndex('by_name', (q) => q.eq('name', args.name))
    .filter((q) => q.eq(q.field('isDeleted'), false))
    .first();

  if (!organization) {
    return null;
  }

  return {
    _id: organization._id,
    name: organization.name,
    slug: organization.slug,
    chatwootAgentBotId: organization.chatwootAgentBotId,
    chatwootAgentBotToken: organization.chatwootAgentBotToken,
    chatwootAccountId: organization.chatwootAccountId,
    chatwootWebsiteToken: organization.chatwootWebsiteToken,
    chatwootIdentityToken: organization.chatwootIdentityToken,
  };
};
