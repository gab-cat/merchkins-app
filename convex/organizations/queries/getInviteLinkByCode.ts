import { QueryCtx } from '../../_generated/server';
import { v } from 'convex/values';

// Get invite link by code
export const getInviteLinkByCodeArgs = {
  code: v.string(),
};

export const getInviteLinkByCodeHandler = async (
  ctx: QueryCtx,
  args: {
    code: string;
  }
) => {
  const inviteLink = await ctx.db
    .query('organizationInviteLinks')
    .withIndex('by_code', (q) => q.eq('code', args.code))
    .filter((q) => q.eq(q.field('isActive'), true))
    .first();

  // Check if invite link exists and is not expired
  if (!inviteLink) {
    return null;
  }

  // Check expiration
  if (inviteLink.expiresAt && inviteLink.expiresAt < Date.now()) {
    return null;
  }

  // Check usage limit
  if (inviteLink.usageLimit && inviteLink.usedCount >= inviteLink.usageLimit) {
    return null;
  }

  return inviteLink;
};
