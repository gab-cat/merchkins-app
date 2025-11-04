import { mutation, internalMutation } from '../../_generated/server';

import { createMessageArgs, createMessageHandler } from './createMessage';
import { replyToMessageArgs, replyToMessageHandler } from './replyToMessage';
import { updateMessageArgs, updateMessageHandler } from './updateMessage';
import { deleteMessageArgs, deleteMessageHandler } from './deleteMessage';
import { restoreMessageArgs, restoreMessageHandler } from './restoreMessage';
import { updateMessageStatsArgs, updateMessageStatsHandler } from './updateMessageStats';

export const createMessage = mutation({
  args: createMessageArgs,
  handler: createMessageHandler,
});

export const replyToMessage = mutation({
  args: replyToMessageArgs,
  handler: replyToMessageHandler,
});

export const updateMessage = mutation({
  args: updateMessageArgs,
  handler: updateMessageHandler,
});

export const deleteMessage = mutation({
  args: deleteMessageArgs,
  handler: deleteMessageHandler,
});

export const restoreMessage = mutation({
  args: restoreMessageArgs,
  handler: restoreMessageHandler,
});

export const updateMessageStats = internalMutation({
  args: updateMessageStatsArgs,
  handler: updateMessageStatsHandler,
});
