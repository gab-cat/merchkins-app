import { MutationCtx } from "../../_generated/server";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";

// Complete user onboarding
export const completeOnboardingArgs = {
  userId: v.id("users"),
  firstName: v.string(),
  lastName: v.string(),
  phone: v.string(),
};

export const completeOnboardingHandler = async (
  ctx: MutationCtx,
  args: {
    userId: Id<"users">;
    firstName: string;
    lastName: string;
    phone: string;
  }
) => {
  const { userId, firstName, lastName, phone } = args;
  
  // Get current user
  const user = await ctx.db.get(userId);
  if (!user || user.isDeleted) {
    throw new Error("User not found");
  }
  
  if (user.isOnboarded) {
    throw new Error("User already onboarded");
  }
  
  // Update user with onboarding data
  await ctx.db.patch(userId, {
    firstName,
    lastName,
    phone,
    isOnboarded: true,
    isSetupDone: true,
    updatedAt: Date.now(),
  });
  
  return { success: true };
};
