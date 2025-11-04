import { DataModel } from '../_generated/dataModel';
import { GenericQueryCtx, GenericMutationCtx } from 'convex/server';
import { Doc } from '../_generated/dataModel';

type QueryCtx = GenericQueryCtx<DataModel>;
type MutationCtx = GenericMutationCtx<DataModel>;
type User = Doc<'users'>;

/**
 * Get current authenticated user from auth context
 */
export async function getCurrentAuthenticatedUser(ctx: QueryCtx | MutationCtx): Promise<User> {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new Error('Authentication required');
  }

  // Get user by Clerk ID
  const user = await ctx.db
    .query('users')
    .withIndex('by_clerkId', (q) => q.eq('clerkId', identity.subject))
    .filter((q) => q.eq(q.field('isDeleted'), false))
    .first();

  if (!user) {
    throw new Error('User not found or inactive');
  }

  return user;
}

/**
 * Check if user is authenticated (has valid auth token)
 */
export async function requireAuthentication(ctx: QueryCtx | MutationCtx): Promise<User> {
  return await getCurrentAuthenticatedUser(ctx);
}

/**
 * Get current user if authenticated, return null if not
 */
export async function getOptionalCurrentUser(ctx: QueryCtx | MutationCtx): Promise<User | null> {
  try {
    return await getCurrentAuthenticatedUser(ctx);
  } catch {
    return null;
  }
}

/**
 * Check if the authenticated user matches the provided user ID
 */
export async function requireSelfOrAdmin(ctx: QueryCtx | MutationCtx, targetUserId: string): Promise<User> {
  const currentUser = await requireAuthentication(ctx);

  // Allow if user is admin or accessing their own data
  if (currentUser.isAdmin || currentUser._id === targetUserId) {
    return currentUser;
  }

  throw new Error('Access denied: insufficient permissions');
}

/**
 * Require user to be admin
 */
export async function requireAdmin(ctx: QueryCtx | MutationCtx): Promise<User> {
  const user = await requireAuthentication(ctx);

  if (!user.isAdmin) {
    throw new Error('Access denied: admin privileges required');
  }

  return user;
}

/**
 * Require user to be staff or admin
 */
export async function requireStaffOrAdmin(ctx: QueryCtx | MutationCtx): Promise<User> {
  const user = await requireAuthentication(ctx);

  if (!user.isStaff && !user.isAdmin) {
    throw new Error('Access denied: staff or admin privileges required');
  }

  return user;
}

/**
 * Require user to be merchant, staff, or admin
 */
export async function requireMerchantOrStaffOrAdmin(ctx: QueryCtx | MutationCtx): Promise<User> {
  const user = await requireAuthentication(ctx);

  if (!user.isMerchant && !user.isStaff && !user.isAdmin) {
    throw new Error('Access denied: merchant, staff, or admin privileges required');
  }

  return user;
}

/**
 * Check if user has completed onboarding
 */
export async function requireOnboardedUser(ctx: QueryCtx | MutationCtx): Promise<User> {
  const user = await requireAuthentication(ctx);

  if (!user.isOnboarded) {
    throw new Error('User must complete onboarding first');
  }

  return user;
}

/**
 * Check if user has setup completed
 */
export async function requireSetupComplete(ctx: QueryCtx | MutationCtx): Promise<User> {
  const user = await requireAuthentication(ctx);

  if (!user.isSetupDone) {
    throw new Error('User must complete setup first');
  }

  return user;
}
