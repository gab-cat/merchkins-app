import { internalMutation } from '../../_generated/server';
import { v } from 'convex/values';

/**
 * Update the status of a storefront application.
 * Internal mutation - only accessible by super admins through other functions.
 */
export const updateStatus = internalMutation({
  args: {
    applicationId: v.id('storefrontApplications'),
    status: v.union(v.literal('APPROVED'), v.literal('REJECTED')),
    reviewerId: v.id('users'),
    notes: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const now = Date.now();

    await ctx.db.patch(args.applicationId, {
      status: args.status,
      reviewedById: args.reviewerId,
      reviewedAt: now,
      notes: args.notes,
      updatedAt: now,
    });

    return null;
  },
});
