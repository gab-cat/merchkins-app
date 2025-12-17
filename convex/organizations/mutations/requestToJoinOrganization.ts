import { MutationCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';
import { requireAuthentication } from '../../helpers/auth';

export const requestToJoinOrganizationArgs = {
  organizationId: v.id('organizations'),
  note: v.optional(v.string()),
};

export const requestToJoinOrganizationHandler = async (ctx: MutationCtx, args: { organizationId: Id<'organizations'>; note?: string }) => {
  const user = await requireAuthentication(ctx);

  const organization = await ctx.db.get(args.organizationId);
  if (!organization || organization.isDeleted) {
    throw new Error('Organization not found');
  }

  if (organization.organizationType === 'PUBLIC') {
    throw new Error('Public organizations can be joined directly without a request');
  }

  if (organization.organizationType === 'SECRET') {
    throw new Error('Secret organizations require an invite link to join');
  }

  // If already a member, short-circuit
  const existingMember = await ctx.db
    .query('organizationMembers')
    .withIndex('by_user_organization', (q) => q.eq('userId', user._id as Id<'users'>).eq('organizationId', args.organizationId))
    .filter((q) => q.eq(q.field('isActive'), true))
    .first();
  if (existingMember) {
    return { success: true, status: 'ALREADY_MEMBER' as const };
  }

  // Upsert a join request to avoid duplicates
  const existingReq = await ctx.db
    .query('organizationJoinRequests')
    .withIndex('by_user_organization', (q) => q.eq('userId', user._id as Id<'users'>).eq('organizationId', args.organizationId))
    .first();

  const now = Date.now();
  if (existingReq) {
    // If previously rejected, allow resubmission by setting back to PENDING
    await ctx.db.patch(existingReq._id, {
      status: 'PENDING',
      note: args.note,
      reviewedById: undefined,
      reviewedAt: undefined,
      updatedAt: now,
    });
    return { success: true, status: 'PENDING' as const };
  }

  await ctx.db.insert('organizationJoinRequests', {
    organizationId: args.organizationId,
    userId: user._id as Id<'users'>,
    status: 'PENDING',
    note: args.note,
    reviewedById: undefined,
    createdAt: now,
    reviewedAt: undefined,
    updatedAt: now,
  });

  return { success: true, status: 'PENDING' as const };
};
