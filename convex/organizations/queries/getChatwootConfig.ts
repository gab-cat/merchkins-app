import { QueryCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';

/**
 * Get Chatwoot configuration for an organization
 * Returns only the website token (identity token is server-only)
 */
export const getChatwootConfigArgs = {
  organizationId: v.id('organizations'),
};

export const getChatwootConfigHandler = async (
  ctx: QueryCtx,
  args: { organizationId: Id<'organizations'> }
): Promise<{ websiteToken: string | null } | null> => {
  const organization = await ctx.db.get(args.organizationId);

  if (!organization || organization.isDeleted) {
    return null;
  }

  return {
    websiteToken: organization.chatwootWebsiteToken || null,
  };
};

