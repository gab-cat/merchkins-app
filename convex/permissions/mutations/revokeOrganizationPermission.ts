import { MutationCtx } from "../../_generated/server";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";
import { 
  requireOrganizationAdmin, 
  logAction 
} from "../../helpers";

// Remove permission from an organization member
export const revokeOrganizationPermissionArgs = {
  organizationId: v.id("organizations"),
  userId: v.id("users"),
  permissionCode: v.string(),
};

export const revokeOrganizationPermissionHandler = async (
  ctx: MutationCtx,
  args: {
    organizationId: Id<"organizations">;
    userId: Id<"users">;
    permissionCode: string;
  }
) => {
  const { organizationId, userId, permissionCode } = args;
  
  // Require organization admin privileges
  const { user: currentUser } = await requireOrganizationAdmin(ctx, organizationId);
  
  // Get organization member
  const member = await ctx.db
    .query("organizationMembers")
    .withIndex("by_user_organization", (q) => 
      q.eq("userId", userId).eq("organizationId", organizationId)
    )
    .filter((q) => q.eq(q.field("isActive"), true))
    .first();
    
  if (!member) {
    throw new Error("User is not an active member of this organization");
  }
  
  // Get current member permissions
  const currentPermissions = member.permissions || [];
  
  // Check if member has this permission
  const permissionExists = currentPermissions.some(p => p.permissionCode === permissionCode);
  
  if (!permissionExists) {
    throw new Error("Member does not have this permission");
  }
  
  // Remove the permission
  const updatedPermissions = currentPermissions.filter(p => p.permissionCode !== permissionCode);
  
  // Update organization member with new permissions
  await ctx.db.patch(member._id, {
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
    "revoke_organization_permission",
    "SECURITY_EVENT",
    "MEDIUM",
    `Revoked organization permission ${permissionCode} from member ${member.userInfo.firstName} ${member.userInfo.lastName}`,
    currentUser._id,
    organizationId,
    { 
      targetUserId: userId,
      targetUserEmail: member.userInfo.email,
      permissionCode,
      permissionName: permission?.name || "Unknown",
      permissionCategory: permission?.category || "Unknown",
      memberRole: member.role
    }
  );
  
  return { success: true };
};
