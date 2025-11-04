import { query } from '../../_generated/server';

import { getChatRoomByIdArgs, getChatRoomByIdHandler } from './getChatRoomById';
import { getChatRoomsArgs, getChatRoomsHandler } from './getChatRooms';
import { getChatRoomsPageArgs, getChatRoomsPageHandler } from './getChatRoomsPage';
import { getMessagesArgs, getMessagesHandler } from './getMessages';
import { searchChatsArgs, searchChatsHandler } from './searchChats';
import { getTypingUsersArgs, getTypingUsersHandler } from './getTypingUsers';
import { getUnreadCountsArgs, getUnreadCountsHandler } from './getUnreadCounts';
import { getUnreadCountArgs, getUnreadCountHandler } from './getUnreadCount';

export const getChatRoomById = query({
  args: getChatRoomByIdArgs,
  handler: getChatRoomByIdHandler,
});

export const getChatRooms = query({
  args: getChatRoomsArgs,
  handler: getChatRoomsHandler,
});

export const getChatRoomsPage = query({
  args: getChatRoomsPageArgs,
  handler: getChatRoomsPageHandler,
});

export const getMessages = query({
  args: getMessagesArgs,
  handler: getMessagesHandler,
});

export const searchChats = query({
  args: searchChatsArgs,
  handler: searchChatsHandler,
});

export const getTypingUsers = query({
  args: getTypingUsersArgs,
  handler: getTypingUsersHandler,
});

export const getUnreadCounts = query({
  args: getUnreadCountsArgs,
  handler: getUnreadCountsHandler,
});

export const getUnreadCount = query({
  args: getUnreadCountArgs,
  handler: getUnreadCountHandler,
});
