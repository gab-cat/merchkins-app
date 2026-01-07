import { QueryCtx } from '../../_generated/server';
import { Infer, v } from 'convex/values';
import { Id } from '../../_generated/dataModel';
import { getOptionalCurrentUser } from '../../helpers/auth';
import { isOrganizationMember } from '../../helpers/organizations';

export const checkStorefrontAccessArgs = v.object({
  organizationId: v.id('organizations'),
});

export const checkStorefrontAccessReturns = v.object({
  hasAccess: v.boolean(),
  reason: v.optional(v.union(v.literal('PUBLIC'), v.literal('MEMBER'), v.literal('ADMIN_OR_STAFF'), v.literal('PRIVILEGED'))),
  organizationType: v.union(v.literal('PUBLIC'), v.literal('PRIVATE'), v.literal('SECRET')),
  hasPendingRequest: v.optional(v.boolean()),
});

export const checkStorefrontAccessHandler = async (
  ctx: QueryCtx,
  args: Infer<typeof checkStorefrontAccessArgs>
): Promise<Infer<typeof checkStorefrontAccessReturns>> => {
  const organization = await ctx.db.get(args.organizationId);
  if (!organization || organization.isDeleted) {
    // Treat deleted/missing orgs as SECRET with no access
    return { hasAccess: false, organizationType: 'SECRET' };
  }

  const orgType = organization.organizationType;

  // PUBLIC organizations are always accessible
  if (orgType === 'PUBLIC') {
    return { hasAccess: true, reason: 'PUBLIC', organizationType: 'PUBLIC' };
  }

  // For PRIVATE and SECRET, check user authentication and membership
  const user = await getOptionalCurrentUser(ctx);
  if (!user) {
    // Not authenticated - no access to PRIVATE/SECRET
    return { hasAccess: false, organizationType: orgType };
  }

  // Check if user is a platform admin or staff (privileged access)
  if (user.isAdmin || user.isStaff) {
    return { hasAccess: true, reason: 'PRIVILEGED', organizationType: orgType };
  }

  // Check if user is an organization member
  const membership = await isOrganizationMember(ctx, user._id, args.organizationId);
  if (membership) {
    // Determine if admin/staff or regular member
    const memberRecord = await ctx.db
      .query('organizationMembers')
      .withIndex('by_user_organization', (q) => q.eq('userId', user._id as Id<'users'>).eq('organizationId', args.organizationId))
      .filter((q) => q.eq(q.field('isActive'), true))
      .first();

    if (memberRecord && (memberRecord.role === 'ADMIN' || memberRecord.role === 'STAFF')) {
      return { hasAccess: true, reason: 'ADMIN_OR_STAFF', organizationType: orgType };
    }

    return { hasAccess: true, reason: 'MEMBER', organizationType: orgType };
  }

  // Not a member - check for pending join request (PRIVATE only)
  if (orgType === 'PRIVATE') {
    const pendingRequest = await ctx.db
      .query('organizationJoinRequests')
      .withIndex('by_user_organization', (q) => q.eq('userId', user._id as Id<'users'>).eq('organizationId', args.organizationId))
      .filter((q) => q.eq(q.field('status'), 'PENDING'))
      .first();

    return {
      hasAccess: false,
      organizationType: 'PRIVATE',
      hasPendingRequest: !!pendingRequest,
    };
  }

  // SECRET organization - no access without membership
  return { hasAccess: false, organizationType: 'SECRET' };
};
