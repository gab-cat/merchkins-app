import { MutationCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';

/**
 * Update the platform fee percentage for an organization.
 * Only super-admins can do this.
 */
export const updateOrgPlatformFeeArgs = {
  organizationId: v.id('organizations'),
  platformFeePercentage: v.number(), // e.g., 15 for 15%
};

export const updateOrgPlatformFeeHandler = async (
  ctx: MutationCtx,
  args: {
    organizationId: Id<'organizations'>;
    platformFeePercentage: number;
  }
) => {
  const now = Date.now();

  // Validate percentage
  if (args.platformFeePercentage < 0 || args.platformFeePercentage > 100) {
    throw new Error('Platform fee percentage must be between 0 and 100');
  }

  // Get the organization
  const org = await ctx.db.get(args.organizationId);
  if (!org) {
    throw new Error('Organization not found');
  }

  // Update the organization
  await ctx.db.patch(args.organizationId, {
    platformFeePercentage: args.platformFeePercentage,
    updatedAt: now,
  });

  return {
    success: true,
    organizationId: args.organizationId,
    organizationName: org.name,
    previousFee: org.platformFeePercentage,
    newFee: args.platformFeePercentage,
  };
};
