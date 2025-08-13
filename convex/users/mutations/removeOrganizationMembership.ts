import { MutationCtx } from "../../_generated/server";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";

// Remove organization membership from user
export const removeOrganizationMembershipArgs = {
  userId: v.id("users"),
  organizationId: v.id("organizations"),
};

export const removeOrganizationMembershipHandler = async (
  ctx: MutationCtx,
  args: {
    userId: Id<"users">;
    organizationId: Id<"organizations">;
  }
) => {
  const { userId, organizationId } = args;
  
  // Get current user
  const user = await ctx.db.get(userId);
  if (!user || user.isDeleted) {
    throw new Error("User not found");
  }
  
  // Remove membership
  const updatedMemberships = (user.organizationMemberships || []).filter(
    (membership) => membership.organizationId !== organizationId
  );
  
  await ctx.db.patch(userId, {
    organizationMemberships: updatedMemberships,
    updatedAt: Date.now(),
  });
  
  return { success: true };
};
