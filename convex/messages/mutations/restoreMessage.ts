import { MutationCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';
import { requireAuthentication, requireOrganizationPermission, logAction } from '../../helpers';

export const restoreMessageArgs = {
  messageId: v.id('messages'),
};

export const restoreMessageHandler = async (ctx: MutationCtx, args: { messageId: Id<'messages'> }) => {
  const currentUser = await requireAuthentication(ctx);
  const existing = await ctx.db.get(args.messageId);
  if (!existing) {
    throw new Error('Message not found');
  }

  if (existing.organizationId) {
    await requireOrganizationPermission(ctx, existing.organizationId, 'MANAGE_TICKETS', 'update');
  } else if (!(currentUser.isAdmin || existing.sentBy === currentUser._id)) {
    throw new Error('Permission denied: You can only restore your own messages');
  }

  if (!existing.isArchived) {
    return args.messageId;
  }

  await ctx.db.patch(args.messageId, { isArchived: false, updatedAt: Date.now() });

  await logAction(ctx, 'restore_message', 'DATA_CHANGE', 'LOW', `Restored message ${args.messageId}`, currentUser._id, existing.organizationId, {
    messageId: args.messageId,
  });

  return args.messageId;
};
