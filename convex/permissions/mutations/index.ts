import { mutation } from "../../_generated/server";

// Import all permission mutation handlers and args
import { createPermissionArgs, createPermissionHandler } from "./createPermission";
import { assignOrganizationPermissionArgs, assignOrganizationPermissionHandler } from "./assignOrganizationPermission";
import { assignUserPermissionArgs, assignUserPermissionHandler } from "./assignUserPermission";
import { bulkAssignUserPermissionsArgs, bulkAssignUserPermissionsHandler } from "./bulkAssignUserPermissions";
import { deletePermissionArgs, deletePermissionHandler } from "./deletePermission";
import { revokeOrganizationPermissionArgs, revokeOrganizationPermissionHandler } from "./revokeOrganizationPermission";
import { revokeUserPermissionArgs, revokeUserPermissionHandler } from "./revokeUserPermission";
import { updatePermissionArgs, updatePermissionHandler } from "./updatePermission";

// Export all permission mutations
export const createPermission = mutation({
  args: createPermissionArgs,
  handler: createPermissionHandler,
});

export const assignOrganizationPermission = mutation({
  args: assignOrganizationPermissionArgs,
  handler: assignOrganizationPermissionHandler,
});

export const assignUserPermission = mutation({
  args: assignUserPermissionArgs,
  handler: assignUserPermissionHandler,
});

export const bulkAssignUserPermissions = mutation({
  args: bulkAssignUserPermissionsArgs,
  handler: bulkAssignUserPermissionsHandler,
});

export const deletePermission = mutation({
  args: deletePermissionArgs,
  handler: deletePermissionHandler,
});

export const revokeOrganizationPermission = mutation({
  args: revokeOrganizationPermissionArgs,
  handler: revokeOrganizationPermissionHandler,
});

export const revokeUserPermission = mutation({
  args: revokeUserPermissionArgs,
  handler: revokeUserPermissionHandler,
});

export const updatePermission = mutation({
  args: updatePermissionArgs,
  handler: updatePermissionHandler,
});
