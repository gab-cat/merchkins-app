import { MutationCtx } from "../../_generated/server";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";

// Deactivate invite link
export const deactivateInviteLinkArgs = {
  inviteLinkId: v.id("organizationInviteLinks"),
};

export const deactivateInviteLinkHandler = async (
  ctx: MutationCtx,
  args: {
    inviteLinkId: Id<"organizationInviteLinks">;
  }
) => {
  const { inviteLinkId } = args;
  
  // Get invite link
  const inviteLink = await ctx.db.get(inviteLinkId);
  if (!inviteLink) {
    throw new Error("Invite link not found");
  }
  
  // Deactivate invite link
  await ctx.db.patch(inviteLinkId, {
    isActive: false,
    updatedAt: Date.now(),
  });
  
  return { success: true };
};
