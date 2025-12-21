import { query, internalQuery } from '../../_generated/server';
import { getOrganizationByIdArgs, getOrganizationByIdHandler } from './getOrganizationById';
import { getOrganizationsArgs, getOrganizationsHandler } from './getOrganizations';
import { checkOrganizationPermissionArgs, checkOrganizationPermissionHandler } from './checkOrganizationPermission';
import { getOrganizationBySlugArgs, getOrganizationBySlugHandler } from './getOrganizationBySlug';
import { getOrganizationsByUserArgs, getOrganizationsByUserHandler } from './getOrganizationsByUser';
import { getOrganizationMembersArgs, getOrganizationMembersHandler, getOrganizationMembersInternalHandler } from './getOrganizationMembers';
import { getOrganizationAnalyticsArgs, getOrganizationAnalyticsHandler } from './getOrganizationAnalytics';
import { getInviteLinkByCodeArgs, getInviteLinkByCodeHandler } from './getInviteLinkByCode';
import { getOrganizationInviteLinksArgs, getOrganizationInviteLinksHandler } from './getOrganizationInviteLinks';
import { searchOrganizationsArgs, searchOrganizationsHandler } from './searchOrganizations';
import { listJoinRequestsArgs, listJoinRequestsHandler } from './listJoinRequests';
import { getPopularOrganizationsArgs, getPopularOrganizationsHandler } from './getPopularOrganizations';
import { getMyJoinRequestStatusArgs, getMyJoinRequestStatusHandler, getMyJoinRequestStatusReturns } from './getMyJoinRequestStatus';
import { getChatwootConfigArgs, getChatwootConfigHandler } from './getChatwootConfig';
import { getOrganizationByNameArgs, getOrganizationByNameHandler, getOrganizationByNameReturns } from './getOrganizationByName';

export const getOrganizationById = query({
  args: getOrganizationByIdArgs,
  handler: getOrganizationByIdHandler,
});
export const getOrganizations = query({
  args: getOrganizationsArgs,
  handler: getOrganizationsHandler,
});
export const checkOrganizationPermission = query({
  args: checkOrganizationPermissionArgs,
  handler: checkOrganizationPermissionHandler,
});
export const getOrganizationBySlug = query({
  args: getOrganizationBySlugArgs,
  handler: getOrganizationBySlugHandler,
});
export const getOrganizationsByUser = query({
  args: getOrganizationsByUserArgs,
  handler: getOrganizationsByUserHandler,
});
export const getOrganizationMembers = query({
  args: getOrganizationMembersArgs,
  handler: getOrganizationMembersHandler,
});

export const getOrganizationMembersInternal = internalQuery({
  args: getOrganizationMembersArgs,
  handler: getOrganizationMembersInternalHandler,
});
export const getOrganizationAnalytics = query({
  args: getOrganizationAnalyticsArgs,
  handler: getOrganizationAnalyticsHandler,
});
export const getInviteLinkByCode = query({
  args: getInviteLinkByCodeArgs,
  handler: getInviteLinkByCodeHandler,
});
export const getOrganizationInviteLinks = query({
  args: getOrganizationInviteLinksArgs,
  handler: getOrganizationInviteLinksHandler,
});
export const searchOrganizations = query({
  args: searchOrganizationsArgs,
  handler: searchOrganizationsHandler,
});
export const listJoinRequests = query({
  args: listJoinRequestsArgs,
  handler: listJoinRequestsHandler,
});
export const getPopularOrganizations = query({
  args: getPopularOrganizationsArgs,
  handler: getPopularOrganizationsHandler,
});
export const getMyJoinRequestStatus = query({
  args: getMyJoinRequestStatusArgs,
  returns: getMyJoinRequestStatusReturns,
  handler: getMyJoinRequestStatusHandler,
});
export const getChatwootConfig = query({
  args: getChatwootConfigArgs,
  handler: getChatwootConfigHandler,
});
export const getOrganizationByName = query({
  args: getOrganizationByNameArgs,
  returns: getOrganizationByNameReturns,
  handler: getOrganizationByNameHandler,
});
