import { MutationCtx } from "../../_generated/server";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";

// Restore soft deleted user
export const restoreUserArgs = {
  userId: v.id("users"),
};

export const restoreUserHandler = async (
  ctx: MutationCtx,
  args: { userId: Id<"users"> }
) => {
  const { userId } = args;
  
  // Get current user
  const user = await ctx.db.get(userId);
  if (!user) {
    throw new Error("User not found");
  }
  
  if (!user.isDeleted) {
    throw new Error("User is not deleted");
  }
  
  // Restore user
  await ctx.db.patch(userId, {
    isDeleted: false,
    updatedAt: Date.now(),
  });
  
  return { success: true };
};
