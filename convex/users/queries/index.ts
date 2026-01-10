import { query } from '../../_generated/server';

// Import args and handlers
import { checkUserPermissionArgs, checkUserPermissionHandler } from './checkUserPermission';
import { getCurrentUserArgs, getCurrentUserHandler } from './getCurrentUser';
import { getRecentlyActiveUsersArgs, getRecentlyActiveUsersHandler } from './getRecentlyActiveUsers';
import { getUserAnalyticsArgs, getUserAnalyticsHandler } from './getUserAnalytics';
import { getUserByIdArgs, getUserByIdHandler } from './getUserById';
import { getUserByEmailArgs, getUserByEmailHandler } from './getUserByEmail';
import { getUsersArgs, getUsersHandler } from './getUsers';
import { getUsersByManagerArgs, getUsersByManagerHandler } from './getUsersByManager';
import { getUsersByOrganizationArgs, getUsersByOrganizationHandler } from './getUsersByOrganization';
import { searchUsersArgs, searchUsersReturns, searchUsersHandler } from './searchUsers';
import { getChatwootHmacTokenArgs, getChatwootHmacTokenHandler } from './getChatwootHmacToken';

// Export query functions
export const checkUserPermission = query({
  args: checkUserPermissionArgs,
  handler: checkUserPermissionHandler,
});

export const getCurrentUser = query({
  args: getCurrentUserArgs,
  handler: getCurrentUserHandler,
});

export const getRecentlyActiveUsers = query({
  args: getRecentlyActiveUsersArgs,
  handler: getRecentlyActiveUsersHandler,
});

export const getUserAnalytics = query({
  args: getUserAnalyticsArgs,
  handler: getUserAnalyticsHandler,
});

export const getUserById = query({
  args: getUserByIdArgs,
  handler: getUserByIdHandler,
});

export const getUserByEmail = query({
  args: getUserByEmailArgs,
  handler: getUserByEmailHandler,
});

export const getUsers = query({
  args: getUsersArgs,
  handler: getUsersHandler,
});

export const getUsersByManager = query({
  args: getUsersByManagerArgs,
  handler: getUsersByManagerHandler,
});

export const getUsersByOrganization = query({
  args: getUsersByOrganizationArgs,
  handler: getUsersByOrganizationHandler,
});

export const searchUsers = query({
  args: searchUsersArgs,
  returns: searchUsersReturns,
  handler: searchUsersHandler,
});

export const getChatwootHmacToken = query({
  args: getChatwootHmacTokenArgs,
  handler: getChatwootHmacTokenHandler,
});
