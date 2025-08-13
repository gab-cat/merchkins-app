import { QueryCtx } from "../../_generated/server";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";
import { requireOrganizationMember } from "../../helpers";

// Get permissions for an organization member
export const getOrganizationMemberPermissionsArgs = {
  organizationId: v.id("organizations"),
  userId: v.id("users"),
  includeInactive: v.optional(v.boolean()),
};

export const getOrganizationMemberPermissionsHandler = async (
  ctx: QueryCtx,
  args: {
    organizationId: Id<"organizations">;
    userId: Id<"users">;
    includeInactive?: boolean;
  }
) => {
  const { organizationId, userId, includeInactive = false } = args;
  
  // Require organization membership to view member permissions
  await requireOrganizationMember(ctx, organizationId);
  
  // Get organization member
  const member = await ctx.db
    .query("organizationMembers")
    .withIndex("by_user_organization", (q) => 
      q.eq("userId", userId).eq("organizationId", organizationId)
    )
    .filter((q) => q.eq(q.field("isActive"), true))
    .first();
    
  if (!member) {
    return null;
  }
  
  // Get member's embedded permissions
  const memberPermissions = member.permissions || [];
  
  // Get permission definitions for additional details
  const permissionDefinitions = await ctx.db
    .query("permissions")
    .filter((q) => q.eq(q.field("isActive"), true))
    .collect();
    
  // If including inactive, get all permissions
  if (includeInactive) {
    const allPermissions = await ctx.db.query("permissions").collect();
    permissionDefinitions.push(...allPermissions.filter(p => !p.isActive));
  }
  
  // Create a map for quick lookup
  const permissionMap = new Map(
    permissionDefinitions.map(p => [p.code, p])
  );
  
  // Combine member permissions with definitions
  const detailedPermissions = memberPermissions
    .map(memberPerm => {
      const definition = permissionMap.get(memberPerm.permissionCode);
      return {
        ...memberPerm,
        definition: definition || null,
        isActive: definition?.isActive || false,
      };
    })
    .filter(p => includeInactive || p.isActive);
  
  return {
    organizationId,
    userId,
    memberRole: member.role,
    userEmail: member.userInfo.email,
    userName: `${member.userInfo.firstName || ''} ${member.userInfo.lastName || ''}`.trim(),
    organizationName: member.organizationInfo.name,
    permissions: detailedPermissions,
    permissionCount: detailedPermissions.length,
    joinedAt: member.joinedAt,
    lastActiveAt: member.lastActiveAt,
  };
};
