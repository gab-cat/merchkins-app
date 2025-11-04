import { QueryCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';
import { requireOrganizationAdmin } from '../../helpers/organizations';

export const listJoinRequestsArgs = {
  organizationId: v.id('organizations'),
  status: v.optional(v.union(v.literal('PENDING'), v.literal('APPROVED'), v.literal('REJECTED'))),
  limit: v.optional(v.number()),
  cursor: v.optional(v.string()),
};

export const listJoinRequestsHandler = async (
  ctx: QueryCtx,
  args: { organizationId: Id<'organizations'>; status?: 'PENDING' | 'APPROVED' | 'REJECTED'; limit?: number; cursor?: string }
) => {
  await requireOrganizationAdmin(ctx, args.organizationId);

  let q = ctx.db
    .query('organizationJoinRequests')
    .withIndex('by_organization_status', (qb) => qb.eq('organizationId', args.organizationId).eq('status', args.status ?? 'PENDING'));

  const results = await q.order('desc').paginate({ numItems: args.limit ?? 50, cursor: args.cursor ?? null });

  return results;
};
