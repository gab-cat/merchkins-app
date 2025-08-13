import { MutationCtx } from "../../_generated/server";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";
import { 
  requireSelfOrAdmin, 
  validateUserExists, 
  logAction 
} from "../../helpers";

// Remove permission from a user
export const revokeUserPermissionArgs = {
  userId: v.id("users"),
  permissionCode: v.string(),
};

export const revokeUserPermissionHandler = async (
  ctx: MutationCtx,
  args: {
    userId: Id<"users">;
    permissionCode: string;
  }
) => {
  const { userId, permissionCode } = args;
  
  // Check authorization - user can update their own permissions or admin can update any
  const currentUser = await requireSelfOrAdmin(ctx, userId);
  
  // Validate target user exists
  const targetUser = await validateUserExists(ctx, userId);
  
  // Get current user permissions
  const currentPermissions = targetUser.permissions || [];
  
  // Check if user has this permission
  const permissionExists = currentPermissions.some(p => p.permissionCode === permissionCode);
  
  if (!permissionExists) {
    throw new Error("User does not have this permission");
  }
  
  // Remove the permission
  const updatedPermissions = currentPermissions.filter(p => p.permissionCode !== permissionCode);
  
  // Update user with new permissions
  await ctx.db.patch(userId, {
    permissions: updatedPermissions,
    updatedAt: Date.now(),
  });
  
  // Get permission details for logging
  const permission = await ctx.db
    .query("permissions")
    .withIndex("by_code", (q) => q.eq("code", permissionCode))
    .first();
  
  // Log the action
  await logAction(
    ctx,
    "revoke_user_permission",
    "SECURITY_EVENT",
    "MEDIUM",
    `Revoked permission ${permissionCode} from user ${targetUser.firstName} ${targetUser.lastName}`,
    currentUser._id,
    undefined,
    { 
      targetUserId: userId,
      targetUserEmail: targetUser.email,
      permissionCode,
      permissionName: permission?.name || "Unknown",
      permissionCategory: permission?.category || "Unknown"
    }
  );
  
  return { success: true };
};
