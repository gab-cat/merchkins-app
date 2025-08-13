import { MutationCtx } from "../../_generated/server";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";

// Soft delete user
export const deleteUserArgs = {
  userId: v.id("users"),
};

export const deleteUserHandler = async (
  ctx: MutationCtx,
  args: { userId: Id<"users"> }
) => {
  const { userId } = args;
  
  // Get current user
  const user = await ctx.db.get(userId);
  if (!user) {
    throw new Error("User not found");
  }
  
  if (user.isDeleted) {
    throw new Error("User already deleted");
  }
  
  // Soft delete user
  await ctx.db.patch(userId, {
    isDeleted: true,
    updatedAt: Date.now(),
  });
  
  return { success: true };
};
