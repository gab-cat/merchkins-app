import { mutation } from '../../_generated/server';
import { v } from 'convex/values';

// Update current user's account settings
export default mutation({
  args: {
    phone: v.optional(v.string()),
    profileVisibility: v.optional(v.union(v.literal('public'), v.literal('private'))),
    notificationPrefs: v.optional(
      v.object({
        emailNotifications: v.boolean(),
        pushNotifications: v.boolean(),
        orderUpdates: v.boolean(),
        promotionalEmails: v.boolean(),
      })
    ),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await ctx.auth.getUserIdentity();
    if (!userId) {
      throw new Error('Not authenticated');
    }

    const user = await ctx.db
      .query('users')
      .filter((q) => q.eq(q.field('clerkId'), userId.subject))
      .first();

    if (!user || user.isDeleted) {
      throw new Error('User not found');
    }

    // Prepare update object with only provided fields
    const updateData: any = {
      updatedAt: Date.now(),
    };

    if (args.phone !== undefined) {
      updateData.phone = args.phone;
    }

    if (args.profileVisibility !== undefined) {
      updateData.profileVisibility = args.profileVisibility;
    }

    if (args.notificationPrefs !== undefined) {
      updateData.notificationPrefs = args.notificationPrefs;
    }

    await ctx.db.patch(user._id, updateData);

    return null;
  },
});
