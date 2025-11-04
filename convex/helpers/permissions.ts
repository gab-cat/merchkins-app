import { DataModel } from '../_generated/dataModel';
import { GenericQueryCtx, GenericMutationCtx } from 'convex/server';
import { Doc } from '../_generated/dataModel';
import { requireAuthentication } from './auth';

type QueryCtx = GenericQueryCtx<DataModel>;
type MutationCtx = GenericMutationCtx<DataModel>;
type User = Doc<'users'>;
type PermissionAction = 'create' | 'read' | 'update' | 'delete';

/**
 * Check if user has specific permission
 */
export async function hasPermission(user: User, permissionCode: string, action: PermissionAction): Promise<boolean> {
  // Admins have all permissions
  if (user.isAdmin) {
    return true;
  }

  // Find specific permission
  const permission = (user.permissions || []).find((p) => p.permissionCode === permissionCode);
  if (!permission) {
    return false;
  }

  // Check specific action permission
  switch (action) {
    case 'create':
      return permission.canCreate;
    case 'read':
      return permission.canRead;
    case 'update':
      return permission.canUpdate;
    case 'delete':
      return permission.canDelete;
    default:
      return false;
  }
}

/**
 * Require user to have specific permission
 */
export async function requirePermission(ctx: QueryCtx | MutationCtx, permissionCode: string, action: PermissionAction): Promise<User> {
  const user = await requireAuthentication(ctx);

  const hasAccess = await hasPermission(user, permissionCode, action);
  if (!hasAccess) {
    throw new Error(`Access denied: missing permission '${permissionCode}' for action '${action}'`);
  }

  return user;
}

/**
 * Check if user has any of the specified permissions
 */
export async function hasAnyPermission(user: User, permissions: Array<{ code: string; action: PermissionAction }>): Promise<boolean> {
  // Admins have all permissions
  if (user.isAdmin) {
    return true;
  }

  for (const { code, action } of permissions) {
    if (await hasPermission(user, code, action)) {
      return true;
    }
  }

  return false;
}

/**
 * Require user to have any of the specified permissions
 */
export async function requireAnyPermission(
  ctx: QueryCtx | MutationCtx,
  permissions: Array<{ code: string; action: PermissionAction }>
): Promise<User> {
  const user = await requireAuthentication(ctx);

  const hasAccess = await hasAnyPermission(user, permissions);
  if (!hasAccess) {
    const permissionStrings = permissions.map((p) => `${p.code}:${p.action}`).join(', ');
    throw new Error(`Access denied: missing any of required permissions: ${permissionStrings}`);
  }

  return user;
}

/**
 * Check if user has all specified permissions
 */
export async function hasAllPermissions(user: User, permissions: Array<{ code: string; action: PermissionAction }>): Promise<boolean> {
  // Admins have all permissions
  if (user.isAdmin) {
    return true;
  }

  for (const { code, action } of permissions) {
    if (!(await hasPermission(user, code, action))) {
      return false;
    }
  }

  return true;
}

/**
 * Require user to have all specified permissions
 */
export async function requireAllPermissions(
  ctx: QueryCtx | MutationCtx,
  permissions: Array<{ code: string; action: PermissionAction }>
): Promise<User> {
  const user = await requireAuthentication(ctx);

  const hasAccess = await hasAllPermissions(user, permissions);
  if (!hasAccess) {
    const permissionStrings = permissions.map((p) => `${p.code}:${p.action}`).join(', ');
    throw new Error(`Access denied: missing required permissions: ${permissionStrings}`);
  }

  return user;
}
