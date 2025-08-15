import { MutationCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';
import { logAction, requireOrganizationAdmin } from '../../helpers';

// Remove member from organization
export const removeMemberArgs = {
  organizationId: v.id('organizations'),
  userId: v.id('users'),
};

export const removeMemberHandler = async (
  ctx: MutationCtx,
  args: {
    organizationId: Id<'organizations'>;
    userId: Id<'users'>;
  },
) => {
  const { organizationId, userId } = args;
  
  // Ensure actor has admin rights; also get actor for logging
  const { user: actor } = await requireOrganizationAdmin(ctx, organizationId);

  // Get organization
  const organization = await ctx.db.get(organizationId);
  if (!organization || organization.isDeleted) {
    throw new Error("Organization not found");
  }
  
  // Get membership
  const membership = await ctx.db
    .query("organizationMembers")
    .withIndex("by_user_organization", (q) => 
      q.eq("userId", userId).eq("organizationId", organizationId)
    )
    .first();
  
  if (!membership) {
    throw new Error("User is not a member of this organization");
  }
  
  // Check if this is the last admin
  if (membership.role === "ADMIN") {
    const adminCount = await ctx.db
      .query("organizationMembers")
      .withIndex("by_organization_role", (q) => 
        q.eq("organizationId", organizationId).eq("role", "ADMIN")
      )
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
    
    if (adminCount.length <= 1) {
      throw new Error("Cannot remove the last admin from the organization");
    }
  }
  
  // Remove membership (soft delete by setting isActive to false)
  await ctx.db.patch(membership._id, {
    isActive: false,
    updatedAt: Date.now(),
  });
  
  // Update organization member count
  const newMemberCount = Math.max(0, organization.memberCount - 1);
  const newAdminCount = membership.role === "ADMIN" 
    ? Math.max(0, organization.adminCount - 1) 
    : organization.adminCount;
  
  await ctx.db.patch(organizationId, {
    memberCount: newMemberCount,
    adminCount: newAdminCount,
    updatedAt: Date.now(),
  });
  
  // Audit log
  await logAction(
    ctx,
    'remove_member',
    'AUDIT_TRAIL',
    'HIGH',
    `Removed member ${userId} from organization ${organization.name}`,
    userId,
    organizationId,
    { role: membership.role },
    {
      resourceType: 'organization_member',
      resourceId: membership._id as unknown as string,
      previousValue: { isActive: true },
      newValue: { isActive: false },
    },
  );
  
  return { success: true };
};
