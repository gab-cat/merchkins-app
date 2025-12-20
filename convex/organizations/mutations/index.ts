import { mutation, internalMutation } from '../../_generated/server';

// Import args and handlers
import { createOrganizationArgs, createOrganizationHandler } from './createOrganization';
import { addMemberArgs, addMemberHandler } from './addMember';
import { createInviteLinkArgs, createInviteLinkHandler } from './createInviteLink';
import { deactivateInviteLinkArgs, deactivateInviteLinkHandler } from './deactivateInviteLink';
import { deleteOrganizationArgs, deleteOrganizationHandler } from './deleteOrganization';
import { joinOrganizationArgs, joinOrganizationHandler } from './joinOrganization';
import { joinPublicOrganizationArgs, joinPublicOrganizationHandler } from './joinPublicOrganization';
import { requestToJoinOrganizationArgs, requestToJoinOrganizationHandler } from './requestToJoinOrganization';
import { reviewJoinRequestArgs, reviewJoinRequestHandler } from './reviewJoinRequest';
import { removeMemberArgs, removeMemberHandler } from './removeMember';
import { updateMemberActivityArgs, updateMemberActivityHandler } from './updateMemberActivity';
import { updateMemberRoleArgs, updateMemberRoleHandler } from './updateMemberRole';
import { updateOrganizationArgs, updateOrganizationHandler } from './updateOrganization';
import { updateOrganizationStatsArgs, updateOrganizationStatsHandler } from './updateOrganizationStats';
import { updateChatwootConfigArgs, updateChatwootConfigReturns, updateChatwootConfigHandler } from './updateChatwootConfig';

// Export mutation functions
export const createOrganization = mutation({
  args: createOrganizationArgs,
  handler: createOrganizationHandler,
});

export const addMember = mutation({
  args: addMemberArgs,
  handler: addMemberHandler,
});

export const createInviteLink = mutation({
  args: createInviteLinkArgs,
  handler: createInviteLinkHandler,
});

export const deactivateInviteLink = mutation({
  args: deactivateInviteLinkArgs,
  handler: deactivateInviteLinkHandler,
});

export const deleteOrganization = mutation({
  args: deleteOrganizationArgs,
  handler: deleteOrganizationHandler,
});

export const joinOrganization = mutation({
  args: joinOrganizationArgs,
  handler: joinOrganizationHandler,
});
export const joinPublicOrganization = mutation({
  args: joinPublicOrganizationArgs,
  handler: joinPublicOrganizationHandler,
});

export const requestToJoinOrganization = mutation({
  args: requestToJoinOrganizationArgs,
  handler: requestToJoinOrganizationHandler,
});

export const reviewJoinRequest = mutation({
  args: reviewJoinRequestArgs,
  handler: reviewJoinRequestHandler,
});

export const removeMember = mutation({
  args: removeMemberArgs,
  handler: removeMemberHandler,
});

export const updateMemberActivity = internalMutation({
  args: updateMemberActivityArgs,
  handler: updateMemberActivityHandler,
});

export const updateMemberRole = mutation({
  args: updateMemberRoleArgs,
  handler: updateMemberRoleHandler,
});

export const updateOrganization = mutation({
  args: updateOrganizationArgs,
  handler: updateOrganizationHandler,
});

export const updateOrganizationStats = internalMutation({
  args: updateOrganizationStatsArgs,
  handler: updateOrganizationStatsHandler,
});

export const updateChatwootConfig = mutation({
  args: updateChatwootConfigArgs,
  returns: updateChatwootConfigReturns,
  handler: updateChatwootConfigHandler,
});
