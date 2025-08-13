import { MutationCtx } from "../../_generated/server";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";

// Update user permissions
export const updateUserPermissionsArgs = {
  userId: v.id("users"),
  permissions: v.array(v.object({
    permissionCode: v.string(),
    canCreate: v.boolean(),
    canRead: v.boolean(),
    canUpdate: v.boolean(),
    canDelete: v.boolean(),
  })),
};

export const updateUserPermissionsHandler = async (
  ctx: MutationCtx,
  args: {
    userId: Id<"users">;
    permissions: Array<{
      permissionCode: string;
      canCreate: boolean;
      canRead: boolean;
      canUpdate: boolean;
      canDelete: boolean;
    }>;
  }
) => {
  const { userId, permissions } = args;
  
  // Get current user
  const user = await ctx.db.get(userId);
  if (!user || user.isDeleted) {
    throw new Error("User not found");
  }
  
  // Update user permissions
  await ctx.db.patch(userId, {
    permissions,
    updatedAt: Date.now(),
  });
  
  return { success: true };
};
