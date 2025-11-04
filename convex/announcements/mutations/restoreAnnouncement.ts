import { MutationCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';
import { requireAuthentication, requireOrganizationPermission, logAction } from '../../helpers';

export const restoreAnnouncementArgs = {
  announcementId: v.id('announcements'),
};

export const restoreAnnouncementHandler = async (ctx: MutationCtx, args: { announcementId: Id<'announcements'> }) => {
  const currentUser = await requireAuthentication(ctx);
  const existing = await ctx.db.get(args.announcementId);
  if (!existing) throw new Error('Announcement not found');

  if (existing.organizationId) {
    await requireOrganizationPermission(ctx, existing.organizationId, 'MANAGE_ANNOUNCEMENTS', 'update');
  } else if (!currentUser.isAdmin) {
    throw new Error('Only system administrators can restore global announcements');
  }

  await ctx.db.patch(args.announcementId, { isActive: true, updatedAt: Date.now() });
  await logAction(
    ctx,
    'restore_announcement',
    'DATA_CHANGE',
    'LOW',
    `Restored announcement ${args.announcementId}`,
    currentUser._id,
    existing.organizationId,
    { announcementId: args.announcementId }
  );

  return args.announcementId;
};
