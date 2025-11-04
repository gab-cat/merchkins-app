import { QueryCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';
import { getOptionalCurrentUser, getOrganizationMembership } from '../../helpers';

export const getPinnedAnnouncementsArgs = {
  organizationId: v.optional(v.id('organizations')),
  category: v.optional(v.string()),
};

export const getPinnedAnnouncementsHandler = async (ctx: QueryCtx, args: { organizationId?: Id<'organizations'>; category?: string }) => {
  const currentUser = await getOptionalCurrentUser(ctx);
  let query;
  const now = Date.now();

  if (args.organizationId) {
    query = ctx.db.query('announcements').withIndex('by_organization', (q) => q.eq('organizationId', args.organizationId!));
  } else {
    query = ctx.db
      .query('announcements')
      .withIndex('by_pinned', (q) => q.eq('isPinned', true))
      .filter((q) => q.eq(q.field('organizationId'), undefined));
  }

  const results = await query
    .filter((q) =>
      q.and(
        q.eq(q.field('isPinned'), true),
        q.eq(q.field('isActive'), true),
        q.lte(q.field('publishedAt'), now),
        q.or(q.eq(q.field('scheduledAt'), undefined), q.lte(q.field('scheduledAt'), now)),
        q.or(q.eq(q.field('expiresAt'), undefined), q.gt(q.field('expiresAt'), now)),
        args.category !== undefined ? q.eq(q.field('category'), args.category) : q.eq(q.field('isPinned'), true)
      )
    )
    .collect();

  // Optional membership check for INTERNAL visibility
  let isMemberOfOrg = false;
  if (args.organizationId && currentUser) {
    const membership = await getOrganizationMembership(ctx, currentUser._id, args.organizationId);
    isMemberOfOrg = !!membership;
  }

  const isStaffLike = !!currentUser && (currentUser.isAdmin || currentUser.isStaff);
  const isMerchant = !!currentUser && !!currentUser.isMerchant;
  const visible = results.filter((ann) => {
    if (ann.organizationId && ann.visibility === 'INTERNAL' && !isMemberOfOrg) {
      return false;
    }
    const allowed =
      ann.targetAudience === 'ALL' ||
      (ann.targetAudience === 'ADMINS' && !!currentUser && currentUser.isAdmin) ||
      (ann.targetAudience === 'STAFF' && isStaffLike) ||
      (ann.targetAudience === 'MERCHANTS' && isMerchant) ||
      (ann.targetAudience === 'CUSTOMERS' && !isStaffLike);
    return allowed;
  });

  visible.sort((a, b) => (b.publishedAt || 0) - (a.publishedAt || 0));
  return visible;
};
