import { internalMutation, MutationCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';

export const deleteLogArgs = {
  logId: v.id('logs'),
};

export const deleteLogHandler = async (ctx: MutationCtx, args: { logId: Id<'logs'> }) => {
  // Hard delete is internal-only and should be used sparingly (e.g., GDPR requests).
  const log = await ctx.db.get(args.logId);
  if (!log) {
    return null;
  }
  await ctx.db.delete(args.logId);
  return null;
};
