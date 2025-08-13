import { MutationCtx } from "../../_generated/server";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";

// Update user preferences
export const updatePreferencesArgs = {
  userId: v.id("users"),
  preferences: v.object({
    notifications: v.optional(v.object({
      email: v.boolean(),
      push: v.boolean(),
      orderUpdates: v.boolean(),
      promotions: v.boolean(),
    })),
    privacy: v.optional(v.object({
      profileVisibility: v.union(v.literal("PUBLIC"), v.literal("PRIVATE")),
      showActivity: v.boolean(),
    })),
  }),
};

export const updatePreferencesHandler = async (
  ctx: MutationCtx,
  args: {
    userId: Id<"users">;
    preferences: {
      notifications?: {
        email: boolean;
        push: boolean;
        orderUpdates: boolean;
        promotions: boolean;
      };
      privacy?: {
        profileVisibility: "PUBLIC" | "PRIVATE";
        showActivity: boolean;
      };
    };
  }
) => {
  const { userId, preferences } = args;
  
  // Get current user
  const user = await ctx.db.get(userId);
  if (!user || user.isDeleted) {
    throw new Error("User not found");
  }
  
  // Merge with existing preferences
  const defaultPreferences = {
    notifications: {
      email: true,
      push: true,
      orderUpdates: true,
      promotions: false,
    },
    privacy: {
      profileVisibility: "PUBLIC" as const,
      showActivity: true,
    },
  };
  
  const currentPreferences = user.preferences || defaultPreferences;
  
  const updatedPreferences = {
    notifications: preferences.notifications || currentPreferences.notifications,
    privacy: preferences.privacy || currentPreferences.privacy,
  };
  
  // Update user preferences
  await ctx.db.patch(userId, {
    preferences: updatedPreferences,
    updatedAt: Date.now(),
  });
  
  return { success: true };
};
