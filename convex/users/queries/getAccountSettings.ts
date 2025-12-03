import { query } from '../../_generated/server';
import { v } from 'convex/values';

// Get current user's account settings
export default query({
  args: {},
  returns: v.object({
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
  }),
  handler: async (ctx) => {
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

    // Return account settings with defaults
    return {
      phone: user.phone,
      profileVisibility: user.profileVisibility || 'public',
      notificationPrefs: user.notificationPrefs || {
        emailNotifications: true,
        pushNotifications: true,
        orderUpdates: true,
        promotionalEmails: false,
      },
    };
  },
});
