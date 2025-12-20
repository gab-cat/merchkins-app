'use server';

import { MutationCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';
import { logAction } from '../../helpers';

/**
 * Update Chatwoot integration configuration for an organization.
 * This mutation is intended for super-admin use only.
 */
export const updateChatwootConfigArgs = {
  organizationId: v.id('organizations'),
  chatwootWebsiteToken: v.optional(v.string()),
  chatwootIdentityToken: v.optional(v.string()),
};

export const updateChatwootConfigReturns = v.object({
  success: v.boolean(),
});

export const updateChatwootConfigHandler = async (
  ctx: MutationCtx,
  args: {
    organizationId: Id<'organizations'>;
    chatwootWebsiteToken?: string;
    chatwootIdentityToken?: string;
  }
) => {
  const { organizationId, chatwootWebsiteToken, chatwootIdentityToken } = args;

  // Get current organization
  const organization = await ctx.db.get(organizationId);
  if (!organization || organization.isDeleted) {
    throw new Error('Organization not found');
  }

  // Build updates object
  const updates: {
    chatwootWebsiteToken?: string;
    chatwootIdentityToken?: string;
    updatedAt: number;
  } = {
    updatedAt: Date.now(),
  };

  // Set tokens - allow empty string to clear
  if (chatwootWebsiteToken !== undefined) {
    updates.chatwootWebsiteToken = chatwootWebsiteToken.trim() || undefined;
  }
  if (chatwootIdentityToken !== undefined) {
    updates.chatwootIdentityToken = chatwootIdentityToken.trim() || undefined;
  }

  // Update organization
  await ctx.db.patch(organizationId, updates);

  // Audit log
  await logAction(
    ctx,
    'update_chatwoot_config',
    'AUDIT_TRAIL',
    'MEDIUM',
    `Updated Chatwoot configuration for ${organization.name}`,
    undefined,
    organizationId,
    { hasWebsiteToken: !!updates.chatwootWebsiteToken, hasIdentityToken: !!updates.chatwootIdentityToken },
    {
      resourceType: 'organization',
      resourceId: organizationId as unknown as string,
    }
  );

  return { success: true };
};
