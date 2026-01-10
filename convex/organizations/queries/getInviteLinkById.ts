import { QueryCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';
import { getOptionalCurrentUser } from '../../helpers/auth';
import { isOrganizationMember } from '../../helpers/organizations';

// Get invite link by ID
export const getInviteLinkByIdArgs = {
  inviteLinkId: v.id('organizationInviteLinks'),
};

export const getInviteLinkByIdHandler = async (
  ctx: QueryCtx,
  args: {
    inviteLinkId: Id<'organizationInviteLinks'>;
  }
) => {
  const inviteLink = await ctx.db.get(args.inviteLinkId);

  if (!inviteLink) {
    return null;
  }

  // Get current user (if authenticated)
  const user = await getOptionalCurrentUser(ctx);

  // If no user is authenticated, deny access
  if (!user) {
    return null;
  }

  // Platform admins and staff can access any invite link
  if (user.isAdmin || user.isStaff) {
    return inviteLink;
  }

  // Check if user is the creator of the invite
  if (inviteLink.createdById === user._id) {
    return inviteLink;
  }

  // Check if user is a member of the organization
  const isMember = await isOrganizationMember(ctx, user._id, inviteLink.organizationId);
  if (isMember) {
    return inviteLink;
  }

  // User is not authorized to access this invite link
  return null;
};
