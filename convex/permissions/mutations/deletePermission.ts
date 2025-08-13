import { MutationCtx } from "../../_generated/server";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";
import { 
  requireAdmin, 
  logAction 
} from "../../helpers";

// Delete (deactivate) a permission
export const deletePermissionArgs = {
  permissionId: v.id("permissions"),
  force: v.optional(v.boolean()), // Force delete even if in use
};

export const deletePermissionHandler = async (
  ctx: MutationCtx,
  args: {
    permissionId: Id<"permissions">;
    force?: boolean;
  }
) => {
  // Require admin privileges for permission deletion
  const currentUser = await requireAdmin(ctx);
  
  // Get existing permission
  const permission = await ctx.db.get(args.permissionId);
  if (!permission) {
    throw new Error("Permission not found");
  }
  
  // Prevent deletion of system permissions unless forced
  if (permission.isSystemPermission && !args.force) {
    throw new Error("Cannot delete system permissions. Use force=true if absolutely necessary.");
  }
  
  // Check if permission is in use (embedded in users or organization members)
  if (!args.force) {
    // Check users with this permission
    const usersWithPermission = await ctx.db
      .query("users")
      .filter((q) => 
        q.and(
          q.eq(q.field("isDeleted"), false),
          q.neq(q.field("permissions"), undefined)
        )
      )
      .collect();
      
    const usersUsingPermission = usersWithPermission.filter(user => 
      user.permissions?.some(p => p.permissionCode === permission.code)
    );
    
    if (usersUsingPermission.length > 0) {
      throw new Error(`Cannot delete permission: ${usersUsingPermission.length} users are using this permission. Use force=true to delete anyway.`);
    }
    
    // Check organization members with this permission
    const orgMembersWithPermission = await ctx.db
      .query("organizationMembers")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
      
    const membersUsingPermission = orgMembersWithPermission.filter(member => 
      member.permissions?.some(p => p.permissionCode === permission.code)
    );
    
    if (membersUsingPermission.length > 0) {
      throw new Error(`Cannot delete permission: ${membersUsingPermission.length} organization members are using this permission. Use force=true to delete anyway.`);
    }
  }
  
  // Deactivate the permission (soft delete)
  await ctx.db.patch(args.permissionId, {
    isActive: false,
    updatedAt: Date.now(),
  });
  
  // If forced deletion, also remove from all users and organization members
  if (args.force) {
    // Remove from users
    const allUsers = await ctx.db
      .query("users")
      .filter((q) => 
        q.and(
          q.eq(q.field("isDeleted"), false),
          q.neq(q.field("permissions"), undefined)
        )
      )
      .collect();
      
    for (const user of allUsers) {
      if (user.permissions?.some(p => p.permissionCode === permission.code)) {
        const updatedPermissions = user.permissions.filter(p => p.permissionCode !== permission.code);
        await ctx.db.patch(user._id, {
          permissions: updatedPermissions,
          updatedAt: Date.now(),
        });
      }
    }
    
    // Remove from organization members
    const allOrgMembers = await ctx.db
      .query("organizationMembers")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
      
    for (const member of allOrgMembers) {
      if (member.permissions?.some(p => p.permissionCode === permission.code)) {
        const updatedPermissions = member.permissions.filter(p => p.permissionCode !== permission.code);
        await ctx.db.patch(member._id, {
          permissions: updatedPermissions,
          updatedAt: Date.now(),
        });
      }
    }
  }
  
  // Log the action
  await logAction(
    ctx,
    "delete_permission",
    "SYSTEM_EVENT",
    "HIGH",
    `${args.force ? 'Force deleted' : 'Deactivated'} permission: ${permission.name} (${permission.code})`,
    currentUser._id,
    undefined,
    { 
      permissionId: args.permissionId,
      permissionCode: permission.code,
      permissionName: permission.name,
      isSystemPermission: permission.isSystemPermission,
      forced: args.force || false
    }
  );
  
  return { success: true };
};
