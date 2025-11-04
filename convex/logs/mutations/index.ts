import { internalMutation, mutation } from '../../_generated/server';

import { createLogArgs, createLogHandler } from './logCreate';
import { archiveLogArgs, archiveLogHandler } from './logArchive';
import { restoreLogArgs, restoreLogHandler } from './logRestore';
import { deleteLogArgs, deleteLogHandler } from './logDelete';

export const createLog = mutation({
  args: createLogArgs,
  handler: createLogHandler,
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
