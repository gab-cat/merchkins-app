import { query } from "../../_generated/server";

// Import args and handlers
import { getPermissionsArgs, getPermissionsHandler } from "./getPermissions";
import { getPermissionUsageSummaryArgs, getPermissionUsageSummaryHandler } from "./getPermissionUsageSummary";
import { checkEntityPermissionArgs, checkEntityPermissionHandler } from "./checkEntityPermission";
import { getOrganizationMemberPermissionsArgs, getOrganizationMemberPermissionsHandler } from "./getOrganizationMemberPermissions";
import { getPermissionAnalyticsArgs, getPermissionAnalyticsHandler } from "./getPermissionAnalytics";
import { getPermissionByCodeArgs, getPermissionByCodeHandler } from "./getPermissionByCode";
import { getPermissionByIdArgs, getPermissionByIdHandler } from "./getPermissionById";
import { getPermissionsByCategoryArgs, getPermissionsByCategoryHandler } from "./getPermissionsByCategory";
import { getUserPermissionsArgs, getUserPermissionsHandler } from "./getUserPermissions";
import { searchPermissionsArgs, searchPermissionsHandler } from "./searchPermissions";

// Export query functions
export const getPermissions = query({
  args: getPermissionsArgs,
  handler: getPermissionsHandler,
});

export const getPermissionUsageSummary = query({
  args: getPermissionUsageSummaryArgs,
  handler: getPermissionUsageSummaryHandler,
});

export const checkEntityPermission = query({
  args: checkEntityPermissionArgs,
  handler: checkEntityPermissionHandler,
});

export const getOrganizationMemberPermissions = query({
  args: getOrganizationMemberPermissionsArgs,
  handler: getOrganizationMemberPermissionsHandler,
});

export const getPermissionAnalytics = query({
  args: getPermissionAnalyticsArgs,
  handler: getPermissionAnalyticsHandler,
});

export const getPermissionByCode = query({
  args: getPermissionByCodeArgs,
  handler: getPermissionByCodeHandler,
});

export const getPermissionById = query({
  args: getPermissionByIdArgs,
  handler: getPermissionByIdHandler,
});

export const getPermissionsByCategory = query({
  args: getPermissionsByCategoryArgs,
  handler: getPermissionsByCategoryHandler,
});

export const getUserPermissions = query({
  args: getUserPermissionsArgs,
  handler: getUserPermissionsHandler,
});

export const searchPermissions = query({
  args: searchPermissionsArgs,
  handler: searchPermissionsHandler,
});
