import { QueryCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';

// Get organizations by user membership
export const getOrganizationsByUserArgs = {
  userId: v.id('users'),
  isActive: v.optional(v.boolean()),
};

export const getOrganizationsByUserHandler = async (
  ctx: QueryCtx,
  args: {
    userId: Id<'users'>;
    isActive?: boolean;
  }
) => {
  const { userId, isActive = true } = args;

  // Get user's organization memberships
  const memberships = await ctx.db
    .query('organizationMembers')
    .withIndex('by_user', (q) => q.eq('userId', userId))
    .filter((q) => q.eq(q.field('isActive'), isActive))
    .collect();

  // Get the organizations for these memberships
  const organizationIds = memberships.map((m) => m.organizationId);
  const organizations = await Promise.all(organizationIds.map((id) => ctx.db.get(id)));

  // Filter out deleted organizations and combine with membership info
  const result = organizations
    .filter((org) => org && !org.isDeleted)
    .map((org) => {
      const membership = memberships.find((m) => m.organizationId === org!._id);
      return {
        ...org,
        membershipInfo: {
          role: membership?.role,
          joinedAt: membership?.joinedAt,
          permissions: membership?.permissions || [],
        },
      };
    });

  return result;
};
