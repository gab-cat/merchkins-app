import { QueryCtx } from "../../_generated/server";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";

// Check if user has specific permission in organization
export const checkOrganizationPermissionArgs = {
  userId: v.id("users"),
  organizationId: v.id("organizations"),
  permissionCode: v.string(),
  action: v.union(v.literal("create"), v.literal("read"), v.literal("update"), v.literal("delete")),
};

export const checkOrganizationPermissionHandler = async (
  ctx: QueryCtx,
  args: {
    userId: Id<"users">;
    organizationId: Id<"organizations">;
    permissionCode: string;
    action: "create" | "read" | "update" | "delete";
  }
) => {
  const { userId, organizationId, permissionCode, action } = args;
  
  // Get user's membership in the organization
  const membership = await ctx.db
    .query("organizationMembers")
    .withIndex("by_user_organization", (q) => 
      q.eq("userId", userId).eq("organizationId", organizationId)
    )
    .filter((q) => q.eq(q.field("isActive"), true))
    .first();
  
  if (!membership) {
    return false;
  }
  
  // Check if user is admin (admins have all permissions)
  if (membership.role === "ADMIN") {
    return true;
  }
  
  // Find specific permission
  const permission = membership.permissions.find(p => p.permissionCode === permissionCode);
  if (!permission) {
    return false;
  }
  
  // Check specific action permission
  switch (action) {
    case "create":
      return permission.canCreate;
    case "read":
      return permission.canRead;
    case "update":
      return permission.canUpdate;
    case "delete":
      return permission.canDelete;
    default:
      return false;
  }
};
