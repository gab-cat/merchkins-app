import { query } from '../../_generated/server';

import { getMessageByIdArgs, getMessageByIdHandler } from './getMessageById';
import { getMessagesArgs, getMessagesHandler } from './getMessages';
import { getConversationArgs, getConversationHandler } from './getConversation';
import { getMessageAnalyticsArgs, getMessageAnalyticsHandler } from './getMessageAnalytics';
import { searchMessagesArgs, searchMessagesHandler } from './searchMessages';
import { getMessagesByEmailArgs, getMessagesByEmailHandler } from './getMessagesByEmail';

export const getMessageById = query({ args: getMessageByIdArgs, handler: getMessageByIdHandler });
export const getMessages = query({ args: getMessagesArgs, handler: getMessagesHandler });
export const getConversation = query({ args: getConversationArgs, handler: getConversationHandler });
export const getMessageAnalytics = query({ args: getMessageAnalyticsArgs, handler: getMessageAnalyticsHandler });
export const searchMessages = query({ args: searchMessagesArgs, handler: searchMessagesHandler });
export const getMessagesByEmail = query({ args: getMessagesByEmailArgs, handler: getMessagesByEmailHandler });
