import { MutationCtx } from "../../_generated/server";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";

// Join organization using invite link
export const joinOrganizationArgs = {
  inviteCode: v.string(),
  userId: v.id("users"),
};

export const joinOrganizationHandler = async (
  ctx: MutationCtx,
  args: {
    inviteCode: string;
    userId: Id<"users">;
  }
) => {
  const { inviteCode, userId } = args;
  
  // Get invite link
  const inviteLink = await ctx.db
    .query("organizationInviteLinks")
    .withIndex("by_code", (q) => q.eq("code", inviteCode))
    .filter((q) => q.eq(q.field("isActive"), true))
    .first();
  
  if (!inviteLink) {
    throw new Error("Invalid invite code");
  }
  
  // Check expiration
  if (inviteLink.expiresAt && inviteLink.expiresAt < Date.now()) {
    throw new Error("Invite link has expired");
  }
  
  // Check usage limit
  if (inviteLink.usageLimit && inviteLink.usedCount >= inviteLink.usageLimit) {
    throw new Error("Invite link usage limit reached");
  }
  
  // Get user
  const user = await ctx.db.get(userId);
  if (!user || user.isDeleted) {
    throw new Error("User not found");
  }
  
  // Get organization
  const organization = await ctx.db.get(inviteLink.organizationId);
  if (!organization || organization.isDeleted) {
    throw new Error("Organization not found");
  }
  
  // Check if user is already a member
  const existingMembership = await ctx.db
    .query("organizationMembers")
    .withIndex("by_user_organization", (q) => 
      q.eq("userId", userId).eq("organizationId", inviteLink.organizationId)
    )
    .first();
  
  if (existingMembership && existingMembership.isActive) {
    throw new Error("User is already a member of this organization");
  }
  
  // Add user as member
  await ctx.db.insert("organizationMembers", {
    userId,
    organizationId: inviteLink.organizationId,
    userInfo: {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      imageUrl: user.imageUrl,
      isStaff: user.isStaff,
    },
    organizationInfo: {
      name: organization.name,
      slug: organization.slug,
      logo: organization.logo,
      organizationType: organization.organizationType,
    },
    role: "MEMBER",
    isActive: true,
    joinedAt: Date.now(),
    lastActiveAt: Date.now(),
    permissions: [], // Default permissions for members
    orderCount: 0,
    messageCount: 0,
    updatedAt: Date.now(),
  });
  
  // Update invite link usage
  const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email;
  await ctx.db.patch(inviteLink._id, {
    usedCount: inviteLink.usedCount + 1,
    usedBy: [
      ...inviteLink.usedBy,
      {
        userId,
        userEmail: user.email,
        userName,
        usedAt: Date.now(),
      }
    ],
    updatedAt: Date.now(),
  });
  
  // Update organization member count
  await ctx.db.patch(inviteLink.organizationId, {
    memberCount: organization.memberCount + 1,
    updatedAt: Date.now(),
  });
  
  return { success: true, organizationId: inviteLink.organizationId };
};
