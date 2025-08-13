import { QueryCtx } from "../../_generated/server";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";
import { requireStaffOrAdmin } from "../../helpers";

// Check if an entity (user or organization member) has a specific permission
export const checkEntityPermissionArgs = {
  entityType: v.union(v.literal("user"), v.literal("organizationMember")),
  entityId: v.id("users"),
  permissionCode: v.string(),
  organizationId: v.optional(v.id("organizations")),
};

export const checkEntityPermissionHandler = async (
  ctx: QueryCtx,
  args: {
    entityType: "user" | "organizationMember";
    entityId: Id<"users">;
    permissionCode: string;
    organizationId?: Id<"organizations">;
  }
) => {
  await requireStaffOrAdmin(ctx);
  
  const { entityType, entityId, permissionCode, organizationId } = args;
  
  if (entityType === "user") {
    const user = await ctx.db.get(entityId);
    
    if (!user || user.isDeleted) {
      return {
        hasPermission: false,
        reason: "User not found or deleted",
        entity: null,
      };
    }
    
    const hasDirectPermission = user.permissions?.some(
      (p) => p.permissionCode === permissionCode && p.canRead
    );
    
    const userFullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown User';
    
    if (hasDirectPermission) {
      return {
        hasPermission: true,
        reason: "Direct user permission",
        entity: {
          _id: user._id,
          email: user.email,
          name: userFullName,
          role: user.isAdmin ? 'ADMIN' : user.isStaff ? 'STAFF' : user.isMerchant ? 'MERCHANT' : 'USER',
        },
        permission: user.permissions?.find((p) => p.permissionCode === permissionCode),
      };
    }
    
    return {
      hasPermission: false,
      reason: "Permission not found",
      entity: {
        _id: user._id,
        email: user.email,
        name: userFullName,
        role: user.isAdmin ? 'ADMIN' : user.isStaff ? 'STAFF' : user.isMerchant ? 'MERCHANT' : 'USER',
      },
    };
  } else {
    if (!organizationId) {
      throw new Error("Organization ID is required for organization member permission checks");
    }
    
    const membership = await ctx.db
      .query("organizationMembers")
      .withIndex("by_user_organization", (q) => 
        q.eq("userId", entityId).eq("organizationId", organizationId)
      )
      .first();
      
    if (!membership || !membership.isActive) {
      return {
        hasPermission: false,
        reason: "Organization membership not found or inactive",
        entity: null,
      };
    }
    
    const hasPermission = membership.permissions?.some(
      (p) => p.permissionCode === permissionCode && p.canRead
    );
    
    if (hasPermission) {
      return {
        hasPermission: true,
        reason: "Organization member permission",
        entity: {
          _id: membership._id,
          userId: membership.userId,
          organizationId: membership.organizationId,
          role: membership.role,
          joinedAt: membership.joinedAt,
        },
        permission: membership.permissions?.find((p) => p.permissionCode === permissionCode),
      };
    }
    
    return {
      hasPermission: false,
      reason: "Permission not found in organization membership",
      entity: {
        _id: membership._id,
        userId: membership.userId,
        organizationId: membership.organizationId,
        role: membership.role,
        joinedAt: membership.joinedAt,
      },
    };
  }
};
