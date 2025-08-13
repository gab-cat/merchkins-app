import { mutation } from "../../_generated/server";

import { createChatRoomArgs, createChatRoomHandler } from "./createChatRoom";
import { sendMessageArgs, sendMessageHandler } from "./sendMessage";
import {
  addParticipantsArgs,
  removeParticipantsArgs,
  addParticipantsHandler,
  removeParticipantsHandler,
} from "./manageParticipants";
import {
  editMessageArgs,
  deleteMessageArgs,
  togglePinMessageArgs,
  reactToMessageArgs,
  markRoomReadArgs,
  editMessageHandler,
  deleteMessageHandler,
  togglePinMessageHandler,
  reactToMessageHandler,
  markRoomReadHandler,
} from "./manageMessage";
import { setTypingArgs, setTypingHandler } from "./updateTyping";
import { updateRoomArgs, updateRoomHandler } from "./updateRoom";

export const createChatRoom = mutation({
  args: createChatRoomArgs,
  handler: createChatRoomHandler,
});

export const sendMessage = mutation({
  args: sendMessageArgs,
  handler: sendMessageHandler,
});

export const addParticipants = mutation({
  args: addParticipantsArgs,
  handler: addParticipantsHandler,
});

export const removeParticipants = mutation({
  args: removeParticipantsArgs,
  handler: removeParticipantsHandler,
});

export const editMessage = mutation({
  args: editMessageArgs,
  handler: editMessageHandler,
});

export const deleteMessage = mutation({
  args: deleteMessageArgs,
  handler: deleteMessageHandler,
});

export const togglePinMessage = mutation({
  args: togglePinMessageArgs,
  handler: togglePinMessageHandler,
});

export const reactToMessage = mutation({
  args: reactToMessageArgs,
  handler: reactToMessageHandler,
});

export const markRoomRead = mutation({
  args: markRoomReadArgs,
  handler: markRoomReadHandler,
});

export const setTyping = mutation({
  args: setTypingArgs,
  handler: setTypingHandler,
});

export const updateRoom = mutation({
  args: updateRoomArgs,
  handler: updateRoomHandler,
});


