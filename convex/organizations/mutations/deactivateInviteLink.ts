import { MutationCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';
import { logAction, requireOrganizationAdminOrStaff } from '../../helpers';

// Deactivate invite link
export const deactivateInviteLinkArgs = {
  inviteLinkId: v.id('organizationInviteLinks'),
};

export const deactivateInviteLinkHandler = async (
  ctx: MutationCtx,
  args: {
    inviteLinkId: Id<'organizationInviteLinks'>;
  },
) => {
  const { inviteLinkId } = args;
  
  // Get invite link
  const inviteLink = await ctx.db.get(inviteLinkId);
  if (!inviteLink) {
    throw new Error("Invite link not found");
  }
  
  // Ensure actor has admin or staff rights
  await requireOrganizationAdminOrStaff(ctx, inviteLink.organizationId);
  
  // Deactivate invite link
  await ctx.db.patch(inviteLinkId, {
    isActive: false,
    updatedAt: Date.now(),
  });
  
  // Audit log
  await logAction(
    ctx,
    'deactivate_invite_link',
    'AUDIT_TRAIL',
    'MEDIUM',
    `Deactivated invite link for organization ${inviteLink.organizationInfo?.name || inviteLink.organizationId}`,
    inviteLink.createdById,
    inviteLink.organizationId,
    { code: inviteLink.code },
    {
      resourceType: 'organization_invite',
      resourceId: inviteLinkId as unknown as string,
      previousValue: { isActive: true },
      newValue: { isActive: false },
    },
  );
  
  return { success: true };
};
