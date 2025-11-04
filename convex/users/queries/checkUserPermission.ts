import { QueryCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';

export const checkUserPermissionArgs = {
  userId: v.id('users'),
  permissionCode: v.string(),
  action: v.union(v.literal('create'), v.literal('read'), v.literal('update'), v.literal('delete')),
};

// Check if user has specific permission
export const checkUserPermissionHandler = async (
  ctx: QueryCtx,
  args: {
    userId: Id<'users'>;
    permissionCode: string;
    action: 'create' | 'read' | 'update' | 'delete';
  }
) => {
  const { userId, permissionCode, action } = args;

  // Get user
  const user = await ctx.db.get(userId);
  if (!user || user.isDeleted) {
    return false;
  }

  // Check if user has admin privileges (admins have all permissions)
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
};
