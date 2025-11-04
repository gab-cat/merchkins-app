import { MutationCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';
import { requireAuthentication, requireOrganizationPermission, logAction } from '../../helpers';

export const deleteAnnouncementArgs = {
  announcementId: v.id('announcements'),
  force: v.optional(v.boolean()),
};

export const deleteAnnouncementHandler = async (ctx: MutationCtx, args: { announcementId: Id<'announcements'>; force?: boolean }) => {
  const currentUser = await requireAuthentication(ctx);
  const existing = await ctx.db.get(args.announcementId);
  if (!existing) throw new Error('Announcement not found');

  if (existing.organizationId) {
    await requireOrganizationPermission(ctx, existing.organizationId, 'MANAGE_ANNOUNCEMENTS', 'delete');
  } else if (!currentUser.isAdmin) {
    throw new Error('Only system administrators can delete global announcements');
  }

  if (args.force && currentUser.isAdmin) {
    await ctx.db.delete(args.announcementId);
    await logAction(
      ctx,
      'hard_delete_announcement',
      'DATA_CHANGE',
      'HIGH',
      `Hard deleted announcement ${args.announcementId}`,
      currentUser._id,
      existing.organizationId,
      { announcementId: args.announcementId }
    );
  } else {
    await ctx.db.patch(args.announcementId, { isActive: false, updatedAt: Date.now() });
    await logAction(
      ctx,
      'archive_announcement',
      'DATA_CHANGE',
      'LOW',
      `Archived announcement ${args.announcementId}`,
      currentUser._id,
      existing.organizationId,
      { announcementId: args.announcementId }
    );
  }

  return { success: true };
};
