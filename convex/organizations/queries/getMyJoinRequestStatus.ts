import { QueryCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';
import { getOptionalCurrentUser } from '../../helpers/auth';

export const getMyJoinRequestStatusArgs = {
  organizationId: v.id('organizations'),
};

export const getMyJoinRequestStatusReturns = v.union(
  v.object({
    hasRequest: v.literal(true),
    status: v.union(v.literal('PENDING'), v.literal('APPROVED'), v.literal('REJECTED')),
    requestId: v.id('organizationJoinRequests'),
    note: v.optional(v.string()),
    createdAt: v.number(),
    reviewedAt: v.optional(v.number()),
  }),
  v.object({
    hasRequest: v.literal(false),
  })
);

export const getMyJoinRequestStatusHandler = async (
  ctx: QueryCtx,
  args: { organizationId: Id<'organizations'> }
): Promise<
  | {
      hasRequest: true;
      status: 'PENDING' | 'APPROVED' | 'REJECTED';
      requestId: Id<'organizationJoinRequests'>;
      note?: string;
      createdAt: number;
      reviewedAt?: number;
    }
  | { hasRequest: false }
> => {
  const user = await getOptionalCurrentUser(ctx);
  if (!user) {
    return { hasRequest: false };
  }

  const request = await ctx.db
    .query('organizationJoinRequests')
    .withIndex('by_user_organization', (q) => q.eq('userId', user._id as Id<'users'>).eq('organizationId', args.organizationId))
    .first();

  if (!request) {
    return { hasRequest: false };
  }

  return {
    hasRequest: true,
    status: request.status,
    requestId: request._id,
    note: request.note,
    createdAt: request.createdAt,
    reviewedAt: request.reviewedAt,
  };
};
