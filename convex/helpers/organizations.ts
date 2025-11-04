import { DataModel } from '../_generated/dataModel';
import { GenericQueryCtx, GenericMutationCtx } from 'convex/server';
import { Doc, Id } from '../_generated/dataModel';
import { requireAuthentication } from './auth';

type QueryCtx = GenericQueryCtx<DataModel>;
type MutationCtx = GenericMutationCtx<DataModel>;
type User = Doc<'users'>;
type Organization = Doc<'organizations'>;
type OrganizationMember = Doc<'organizationMembers'>;

/**
 * Check if user is member of organization
 */
export async function isOrganizationMember(ctx: QueryCtx | MutationCtx, userId: Id<'users'>, organizationId: Id<'organizations'>): Promise<boolean> {
  const membership = await ctx.db
    .query('organizationMembers')
    .withIndex('by_user_organization', (q) => q.eq('userId', userId).eq('organizationId', organizationId))
    .filter((q) => q.eq(q.field('isActive'), true))
    .first();

  return !!membership;
}

/**
 * Get user's organization membership
 */
export async function getOrganizationMembership(
  ctx: QueryCtx | MutationCtx,
  userId: Id<'users'>,
  organizationId: Id<'organizations'>
): Promise<OrganizationMember | null> {
  return await ctx.db
    .query('organizationMembers')
    .withIndex('by_user_organization', (q) => q.eq('userId', userId).eq('organizationId', organizationId))
    .filter((q) => q.eq(q.field('isActive'), true))
    .first();
}

/**
 * Require user to be member of organization
 */
export async function requireOrganizationMember(
  ctx: QueryCtx | MutationCtx,
  organizationId: Id<'organizations'>
): Promise<{ user: User; membership: OrganizationMember }> {
  const user = await requireAuthentication(ctx);

  const membership = await getOrganizationMembership(ctx, user._id, organizationId);
  if (!membership) {
    throw new Error('Access denied: not a member of this organization');
  }

  return { user, membership };
}

/**
 * Require user to be admin of organization
 */
export async function requireOrganizationAdmin(
  ctx: QueryCtx | MutationCtx,
  organizationId: Id<'organizations'>
): Promise<{ user: User; membership: OrganizationMember }> {
  const { user, membership } = await requireOrganizationMember(ctx, organizationId);

  // System admins can access any organization
  if (user.isAdmin) {
    return { user, membership };
  }

  if (membership.role !== 'ADMIN') {
    throw new Error('Access denied: organization admin privileges required');
  }

  return { user, membership };
}

/**
 * Require user to be admin or staff of organization
 */
export async function requireOrganizationAdminOrStaff(
  ctx: QueryCtx | MutationCtx,
  organizationId: Id<'organizations'>
): Promise<{ user: User; membership: OrganizationMember }> {
  const { user, membership } = await requireOrganizationMember(ctx, organizationId);

  // System admins can access any organization
  if (user.isAdmin) {
    return { user, membership };
  }

  if (membership.role !== 'ADMIN' && membership.role !== 'STAFF') {
    throw new Error('Access denied: organization admin or staff privileges required');
  }

  return { user, membership };
}

/**
 * Check if user has specific permission in organization
 */
export async function hasOrganizationPermission(
  membership: OrganizationMember,
  permissionCode: string,
  action: 'create' | 'read' | 'update' | 'delete'
): Promise<boolean> {
  // Admins have all permissions
  if (membership.role === 'ADMIN') {
    return true;
  }

  // Find specific permission
  const permission = (membership.permissions || []).find((p) => p.permissionCode === permissionCode);
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
 * Require user to have specific permission in organization
 */
export async function requireOrganizationPermission(
  ctx: QueryCtx | MutationCtx,
  organizationId: Id<'organizations'>,
  permissionCode: string,
  action: 'create' | 'read' | 'update' | 'delete'
): Promise<{ user: User; membership: OrganizationMember }> {
  const { user, membership } = await requireOrganizationMember(ctx, organizationId);

  // System admins have all permissions
  if (user.isAdmin) {
    return { user, membership };
  }

  const hasAccess = await hasOrganizationPermission(membership, permissionCode, action);
  if (!hasAccess) {
    throw new Error(`Access denied: missing organization permission '${permissionCode}' for action '${action}'`);
  }

  return { user, membership };
}

/**
 * Check if organization exists and is active
 */
export async function requireActiveOrganization(ctx: QueryCtx | MutationCtx, organizationId: Id<'organizations'>): Promise<Organization> {
  const organization = await ctx.db.get(organizationId);

  if (!organization || organization.isDeleted) {
    throw new Error('Organization not found or inactive');
  }

  return organization;
}

/**
 * Require user to be owner of organization (creator)
 */
export async function requireOrganizationOwner(
  ctx: QueryCtx | MutationCtx,
  organizationId: Id<'organizations'>
): Promise<{ user: User; membership: OrganizationMember; organization: Organization }> {
  const { user, membership } = await requireOrganizationAdmin(ctx, organizationId);
  const organization = await requireActiveOrganization(ctx, organizationId);

  // System admins can act as owners
  if (user.isAdmin) {
    return { user, membership, organization };
  }

  // Check if user is the original creator (first admin)
  const firstMembership = await ctx.db
    .query('organizationMembers')
    .withIndex('by_organization', (q) => q.eq('organizationId', organizationId))
    .filter((q) => q.eq(q.field('role'), 'ADMIN'))
    .order('asc')
    .first();

  if (!firstMembership || firstMembership.userId !== user._id) {
    throw new Error('Access denied: organization owner privileges required');
  }

  return { user, membership, organization };
}
