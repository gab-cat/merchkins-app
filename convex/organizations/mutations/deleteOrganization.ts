import { MutationCtx } from "../../_generated/server";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";
import { requireOrganizationOwner, logAction } from "../../helpers";

// Soft delete organization
export const deleteOrganizationArgs = {
  organizationId: v.id("organizations"),
};

export const deleteOrganizationHandler = async (
  ctx: MutationCtx,
  args: {
    organizationId: Id<"organizations">;
  }
) => {
  const { organizationId } = args;
  
  // Require organization owner permissions
  const { user, organization } = await requireOrganizationOwner(ctx, organizationId);
  
  if (organization.isDeleted) {
    throw new Error("Organization already deleted");
  }
  
  // Soft delete organization
  await ctx.db.patch(organizationId, {
    isDeleted: true,
    updatedAt: Date.now(),
  });
  
  // Deactivate all members
  const members = await ctx.db
    .query("organizationMembers")
    .withIndex("by_organization", (q) => q.eq("organizationId", organizationId))
    .collect();
  
  for (const member of members) {
    await ctx.db.patch(member._id, {
      isActive: false,
      updatedAt: Date.now(),
    });
  }
  
  // Deactivate all invite links
  const inviteLinks = await ctx.db
    .query("organizationInviteLinks")
    .withIndex("by_organization", (q) => q.eq("organizationId", organizationId))
    .collect();
  
  for (const inviteLink of inviteLinks) {
    await ctx.db.patch(inviteLink._id, {
      isActive: false,
      updatedAt: Date.now(),
    });
  }
  
  // Log the action
  await logAction(
    ctx,
    "delete_organization",
    "DATA_CHANGE",
    "HIGH",
    `Deleted organization: ${organization.name}`,
    user._id,
    organizationId,
    { 
      organizationName: organization.name,
      organizationSlug: organization.slug,
      memberCount: members.length 
    }
  );
  
  return { success: true };
};
