import { MutationCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id, Doc } from '../../_generated/dataModel';
import { internal } from '../../_generated/api';
import { requireAuthentication, validateUserExists, sanitizeString, logAction } from '../../helpers';

export const sendMessageArgs = {
  chatRoomId: v.id('chatRooms'),
  content: v.string(),
  messageType: v.optional(v.union(v.literal('text'), v.literal('image'), v.literal('file'), v.literal('system'), v.literal('announcement'))),
  attachments: v.optional(
    v.array(
      v.object({
        url: v.string(),
        name: v.string(),
        size: v.optional(v.number()),
        mimeType: v.optional(v.string()),
      })
    )
  ),
  replyToId: v.optional(v.id('chatMessages')),
  mentions: v.optional(v.array(v.id('users'))),
};

export const sendMessageHandler = async (
  ctx: MutationCtx,
  args: {
    chatRoomId: Id<'chatRooms'>;
    content: string;
    messageType?: 'text' | 'image' | 'file' | 'system' | 'announcement';
    attachments?: Array<{ url: string; name: string; size?: number; mimeType?: string }>;
    replyToId?: Id<'chatMessages'>;
    mentions?: Array<Id<'users'>>;
  }
) => {
  const currentUser = await requireAuthentication(ctx);
  const now = Date.now();

  // Validate room exists and active
  const chatRoom = await ctx.db.get(args.chatRoomId);
  if (!chatRoom || !chatRoom.isActive) {
    throw new Error('Chat room not found or inactive');
  }

  // Check membership: either embedded or in chatParticipants
  let isMember = !!(chatRoom.embeddedParticipants || []).find((p) => p.userId === currentUser._id && p.isActive);
  if (!isMember) {
    const membership = await ctx.db
      .query('chatParticipants')
      .withIndex('by_chat_and_user', (q) => q.eq('chatRoomId', args.chatRoomId).eq('userId', currentUser._id))
      .filter((q) => q.eq(q.field('isActive'), true))
      .first();
    isMember = !!membership;
  }
  if (!isMember) {
    throw new Error('You are not a participant of this chat room');
  }

  const content = sanitizeString(args.content);
  if (content.length === 0) {
    throw new Error('Message cannot be empty');
  }

  // If replying, fetch minimal info for replyToInfo
  let replyToInfo: Doc<'chatMessages'> | null = null;
  if (args.replyToId) {
    replyToInfo = await ctx.db.get(args.replyToId);
    if (!replyToInfo || replyToInfo.isDeleted) {
      throw new Error('Cannot reply to a non-existent or deleted message');
    }
    if (replyToInfo.chatRoomId !== args.chatRoomId) {
      throw new Error('Reply target must be in the same chat room');
    }
  }

  // Validate mentions exist
  const mentions = Array.from(new Set(args.mentions || []));
  for (const mentioned of mentions) {
    await validateUserExists(ctx, mentioned);
  }

  // Create message
  const messageId = await ctx.db.insert('chatMessages', {
    chatRoomId: args.chatRoomId,
    senderId: currentUser._id,
    senderInfo: {
      firstName: currentUser.firstName,
      lastName: currentUser.lastName,
      imageUrl: currentUser.imageUrl,
      email: currentUser.email,
    },
    content,
    messageType: args.messageType || 'text',
    attachments: args.attachments && args.attachments.length > 0 ? args.attachments : undefined,
    replyToId: args.replyToId,
    replyToInfo: replyToInfo
      ? {
          content: replyToInfo.content,
          senderId: replyToInfo.senderId,
          senderName: `${replyToInfo.senderInfo.firstName || ''} ${replyToInfo.senderInfo.lastName || ''}`.trim(),
        }
      : undefined,
    reactions: [],
    isEdited: false,
    editHistory: undefined,
    isDeleted: false,
    isPinned: false,
    readBy: [{ userId: currentUser._id, readAt: now }],
    mentions,
    createdAt: now,
    updatedAt: now,
  });

  // Update chat room
  await ctx.db.patch(args.chatRoomId, {
    lastMessageAt: now,
    lastMessagePreview: content.slice(0, 140),
    lastMessageSenderId: currentUser._id,
    updatedAt: now,
    unreadMessageCount: (chatRoom.unreadMessageCount || 0) + 1,
  });

  // Update unread counts
  const state = await ctx.db
    .query('chatRoomState')
    .withIndex('by_chat_room', (q) => q.eq('chatRoomId', args.chatRoomId))
    .unique();
  if (state) {
    const updated = state.unreadCounts.map((uc) => (uc.userId === currentUser._id ? { ...uc, lastReadAt: now } : { ...uc, count: uc.count + 1 }));
    await ctx.db.patch(state._id, { unreadCounts: updated, updatedAt: now });
  }

  // Update org member activity if applicable
  if (chatRoom.organizationId) {
    await ctx.runMutation(internal.organizations.mutations.index.updateMemberActivity, {
      userId: currentUser._id,
      organizationId: chatRoom.organizationId,
      incrementMessages: true,
    });
  }

  await logAction(
    ctx,
    'send_chat_message',
    'DATA_CHANGE',
    'LOW',
    `Sent message in room ${args.chatRoomId}`,
    currentUser._id,
    chatRoom.organizationId,
    { messageId, chatRoomId: args.chatRoomId }
  );

  return messageId;
};
