import { MutationCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Doc, Id } from '../../_generated/dataModel';

// Update user account settings (legacy - kept for backwards compatibility)
export const updatePreferencesArgs = {
  userId: v.id('users'),
  preferences: v.object({
    notifications: v.optional(
      v.object({
        email: v.boolean(),
        push: v.boolean(),
        orderUpdates: v.boolean(),
        promotions: v.boolean(),
      })
    ),
    privacy: v.optional(
      v.object({
        profileVisibility: v.union(v.literal('PUBLIC'), v.literal('PRIVATE')),
        showActivity: v.boolean(),
      })
    ),
  }),
};

export const updatePreferencesHandler = async (
  ctx: MutationCtx,
  args: {
    userId: Id<'users'>;
    preferences: {
      notifications?: {
        email: boolean;
        push: boolean;
        orderUpdates: boolean;
        promotions: boolean;
      };
      privacy?: {
        profileVisibility: 'PUBLIC' | 'PRIVATE';
        showActivity: boolean;
      };
    };
  }
) => {
  const { userId, preferences } = args;

  // Get current user
  const user = await ctx.db.get(userId);
  if (!user || user.isDeleted) {
    throw new Error('User not found');
  }

  // Convert legacy preferences to new format
  const updateData: Partial<Doc<'users'>> = {
    updatedAt: Date.now(),
  };

  if (preferences.notifications) {
    updateData.notificationPrefs = {
      emailNotifications: preferences.notifications.email ?? true,
      pushNotifications: preferences.notifications.push ?? true,
      orderUpdates: preferences.notifications.orderUpdates ?? true,
      promotionalEmails: preferences.notifications.promotions ?? false,
    };
  }

  if (preferences.privacy?.profileVisibility) {
    updateData.profileVisibility = preferences.privacy.profileVisibility === 'PUBLIC' ? 'public' : 'private';
  }

  // Update user preferences
  await ctx.db.patch(userId, updateData);

  return { success: true };
};
