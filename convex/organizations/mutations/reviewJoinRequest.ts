import { MutationCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';
import { requireOrganizationAdmin } from '../../helpers/organizations';

export const reviewJoinRequestArgs = {
  organizationId: v.id('organizations'),
  requestId: v.id('organizationJoinRequests'),
  approve: v.boolean(),
  note: v.optional(v.string()),
};

export const reviewJoinRequestHandler = async (
  ctx: MutationCtx,
  args: {
    organizationId: Id<'organizations'>;
    requestId: Id<'organizationJoinRequests'>;
    approve: boolean;
    note?: string;
  }
) => {
  const { user: reviewer } = await requireOrganizationAdmin(ctx, args.organizationId);

  const request = await ctx.db.get(args.requestId);
  if (!request || request.organizationId !== args.organizationId) {
    throw new Error('Join request not found');
  }

  if (request.status !== 'PENDING') {
    return { success: true, status: request.status };
  }

  const now = Date.now();

  if (!args.approve) {
    await ctx.db.patch(request._id, {
      status: 'REJECTED',
      note: args.note,
      reviewedById: reviewer._id as Id<'users'>,
      reviewedAt: now,
      updatedAt: now,
    });
    return { success: true, status: 'REJECTED' as const };
  }

  // Approve: create membership as MEMBER if not already active
  const existingMembership = await ctx.db
    .query('organizationMembers')
    .withIndex('by_user_organization', (q) => q.eq('userId', request.userId).eq('organizationId', args.organizationId))
    .first();

  if (existingMembership) {
    await ctx.db.patch(existingMembership._id, {
      isActive: true,
      role: existingMembership.role || 'MEMBER',
      lastActiveAt: now,
      updatedAt: now,
    });
  } else {
    const org = await ctx.db.get(args.organizationId);
    const user = await ctx.db.get(request.userId);
    if (!org || !user) {
      throw new Error('Invalid organization or user');
    }
    await ctx.db.insert('organizationMembers', {
      userId: request.userId,
      organizationId: args.organizationId,
      userInfo: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        imageUrl: user.imageUrl,
        isStaff: user.isStaff,
      },
      organizationInfo: {
        name: org.name,
        slug: org.slug,
        logo: org.logo,
        organizationType: org.organizationType,
      },
      role: 'MEMBER',
      isActive: true,
      joinedAt: now,
      lastActiveAt: now,
      permissions: [],
      orderCount: 0,
      messageCount: 0,
      updatedAt: now,
    });
  }

  // Update request
  await ctx.db.patch(request._id, {
    status: 'APPROVED',
    note: args.note,
    reviewedById: reviewer._id as Id<'users'>,
    reviewedAt: now,
    updatedAt: now,
  });

  // Recompute org member/admin counts
  const activeMembers = await ctx.db
    .query('organizationMembers')
    .withIndex('by_organization_active', (q) => q.eq('organizationId', args.organizationId).eq('isActive', true))
    .collect();
  const adminCount = activeMembers.filter((m) => m.role === 'ADMIN').length;
  await ctx.db.patch(args.organizationId, {
    memberCount: activeMembers.length,
    adminCount,
    updatedAt: now,
  });

  return { success: true, status: 'APPROVED' as const };
};
