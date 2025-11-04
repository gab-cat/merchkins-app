import { MutationCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';
import { requireAuthentication, requireOrganizationPermission, logAction } from '../../helpers';

export const deleteMessageArgs = {
  messageId: v.id('messages'),
  force: v.optional(v.boolean()),
};

export const deleteMessageHandler = async (ctx: MutationCtx, args: { messageId: Id<'messages'>; force?: boolean }) => {
  const currentUser = await requireAuthentication(ctx);
  const existing = await ctx.db.get(args.messageId);
  if (!existing) {
    throw new Error('Message not found');
  }

  if (existing.organizationId) {
    await requireOrganizationPermission(ctx, existing.organizationId, 'MANAGE_TICKETS', 'delete');
  } else if (!(currentUser.isAdmin || existing.sentBy === currentUser._id)) {
    throw new Error('Permission denied: You can only delete your own messages');
  }

  if (args.force && currentUser.isAdmin) {
    await ctx.db.delete(args.messageId);
    await logAction(
      ctx,
      'hard_delete_message',
      'DATA_CHANGE',
      'HIGH',
      `Hard deleted message ${args.messageId}`,
      currentUser._id,
      existing.organizationId,
      { messageId: args.messageId }
    );
  } else {
    await ctx.db.patch(args.messageId, { isArchived: true, updatedAt: Date.now() });
    await logAction(ctx, 'archive_message', 'DATA_CHANGE', 'LOW', `Archived message ${args.messageId}`, currentUser._id, existing.organizationId, {
      messageId: args.messageId,
    });
  }

  return { success: true };
};
