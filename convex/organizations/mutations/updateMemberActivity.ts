import { MutationCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';

// Update member activity (called internally when members perform actions)
export const updateMemberActivityArgs = {
  userId: v.id('users'),
  organizationId: v.id('organizations'),
  incrementOrders: v.optional(v.boolean()),
  incrementMessages: v.optional(v.boolean()),
};

export const updateMemberActivityHandler = async (
  ctx: MutationCtx,
  args: {
    userId: Id<'users'>;
    organizationId: Id<'organizations'>;
    incrementOrders?: boolean;
    incrementMessages?: boolean;
  }
) => {
  const { userId, organizationId, incrementOrders = false, incrementMessages = false } = args;

  // Get membership
  const membership = await ctx.db
    .query('organizationMembers')
    .withIndex('by_user_organization', (q) => q.eq('userId', userId).eq('organizationId', organizationId))
    .filter((q) => q.eq(q.field('isActive'), true))
    .first();

  if (!membership) {
    throw new Error('User is not a member of this organization');
  }

  const updates = {
    lastActiveAt: Date.now(),
    updatedAt: Date.now(),
  } as Record<string, unknown>;

  if (incrementOrders) {
    updates.orderCount = membership.orderCount + 1;
    updates.lastOrderAt = Date.now();
  }

  if (incrementMessages) {
    updates.messageCount = membership.messageCount + 1;
  }

  // Update member activity
  await ctx.db.patch(membership._id, updates);

  return { success: true };
};
