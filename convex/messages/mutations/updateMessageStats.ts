import { MutationCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';

export const updateMessageStatsArgs = {
  messageId: v.id('messages'),
  updates: v.object({
    sentimentScore: v.optional(v.number()),
    urgencyScore: v.optional(v.number()),
  }),
};

export const updateMessageStatsHandler = async (
  ctx: MutationCtx,
  args: { messageId: Id<'messages'>; updates: { sentimentScore?: number; urgencyScore?: number } }
) => {
  const existing = await ctx.db.get(args.messageId);
  if (!existing) return args.messageId;

  await ctx.db.patch(args.messageId, {
    ...args.updates,
    updatedAt: Date.now(),
  });

  return args.messageId;
};
