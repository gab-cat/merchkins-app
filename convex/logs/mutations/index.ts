import { internalMutation, mutation } from '../../_generated/server';

import { createLogArgs, createLogHandler } from './logCreate';
import { createLogInternalArgs, createLogInternalHandler } from './logCreateInternal';
import { archiveLogArgs, archiveLogHandler } from './logArchive';
import { restoreLogArgs, restoreLogHandler } from './logRestore';
import { deleteLogArgs, deleteLogHandler } from './logDelete';
import { v } from 'convex/values';

export const createLog = mutation({
  args: createLogArgs,
  handler: createLogHandler,
});

export const createLogInternal = internalMutation({
  args: createLogInternalArgs,
  returns: v.null(),
  handler: async (ctx, args) => {
    await createLogInternalHandler(ctx, args);
    return null;
  },
});

export const archiveLog = mutation({
  args: archiveLogArgs,
  handler: archiveLogHandler,
});

export const restoreLog = mutation({
  args: restoreLogArgs,
  handler: restoreLogHandler,
});

export const deleteLog = internalMutation({
  args: deleteLogArgs,
  handler: deleteLogHandler,
});
