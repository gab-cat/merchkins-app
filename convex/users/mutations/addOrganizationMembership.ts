import { MutationCtx } from "../../_generated/server";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";

// Add organization membership to user
export const addOrganizationMembershipArgs = {
  userId: v.id("users"),
  organizationId: v.id("organizations"),
  organizationName: v.string(),
  organizationSlug: v.string(),
  role: v.string(),
};

export const addOrganizationMembershipHandler = async (
  ctx: MutationCtx,
  args: {
    userId: Id<"users">;
    organizationId: Id<"organizations">;
    organizationName: string;
    organizationSlug: string;
    role: string;
  }
) => {
  const { userId, organizationId, organizationName, organizationSlug, role } = args;
  
  // Get current user
  const user = await ctx.db.get(userId);
  if (!user || user.isDeleted) {
    throw new Error("User not found");
  }
  
  // Check if membership already exists
  const existingMembership = (user.organizationMemberships || []).find(
    (membership) => membership.organizationId === organizationId
  );
  
  if (existingMembership) {
    throw new Error("User is already a member of this organization");
  }
  
  // Add new membership
  const newMembership = {
    organizationId,
    organizationName,
    organizationSlug,
    role,
    isActive: true,
    joinedAt: Date.now(),
  };
  
  await ctx.db.patch(userId, {
    organizationMemberships: [...(user.organizationMemberships || []), newMembership],
    updatedAt: Date.now(),
  });
  
  return { success: true };
};
