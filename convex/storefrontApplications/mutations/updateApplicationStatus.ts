import { mutation } from '../../_generated/server';
import { v } from 'convex/values';
import { requireAdmin } from '../../helpers';

/**
 * Update the status of a storefront application.
 * Requires admin privileges.
 */
export const updateApplicationStatus = mutation({
  args: {
    applicationId: v.id('storefrontApplications'),
    status: v.union(v.literal('APPROVED'), v.literal('REJECTED')),
    notes: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Require admin privileges
    const admin = await requireAdmin(ctx);
    const now = Date.now();

    await ctx.db.patch(args.applicationId, {
      status: args.status,
      reviewedById: admin._id,
      reviewedAt: now,
      notes: args.notes,
      updatedAt: now,
    });

    return null;
  },
});
