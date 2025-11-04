import { MutationCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id, Doc } from '../../_generated/dataModel';
import {
  requireAuthentication,
  validateUserExists,
  validateOrganizationExists,
  requireOrganizationMember,
  sanitizeString,
  logAction,
} from '../../helpers';

type ChatType = 'direct' | 'group' | 'public';

export const createChatRoomArgs = {
  type: v.union(v.literal('direct'), v.literal('group'), v.literal('public')),
  name: v.optional(v.string()),
  description: v.optional(v.string()),
  organizationId: v.optional(v.id('organizations')),
  participantIds: v.optional(v.array(v.id('users'))),
  initialMessage: v.optional(v.string()),
};

export const createChatRoomHandler = async (
  ctx: MutationCtx,
  args: {
    type: ChatType;
    name?: string;
    description?: string;
    organizationId?: Id<'organizations'>;
    participantIds?: Array<Id<'users'>>;
    initialMessage?: string;
  }
) => {
  const currentUser = await requireAuthentication(ctx);

  if (args.organizationId) {
    // Ensure organization exists and user is a member
    await validateOrganizationExists(ctx, args.organizationId);
    await requireOrganizationMember(ctx, args.organizationId);
  }

  const now = Date.now();
  const chatType: ChatType = args.type;

  // Clean up text fields
  const name = args.name ? sanitizeString(args.name) : undefined;
  const description = args.description ? sanitizeString(args.description) : undefined;

  // Build full participant list (always include current user)
  const requestedParticipantIds: Array<Id<'users'>> = Array.from(new Set([...(args.participantIds || []), currentUser._id]));

  // Validate users exist
  const participants: Array<Doc<'users'>> = [];
  for (const userId of requestedParticipantIds) {
    const user = await validateUserExists(ctx, userId);
    participants.push(user);
  }

  // Enforce rules for direct chats
  if (chatType === 'direct') {
    // For direct, only two people are allowed: current user and one other
    const otherIds = requestedParticipantIds.filter((id) => id !== currentUser._id);
    if (otherIds.length !== 1) {
      throw new Error('Direct chats must include exactly one other participant');
    }

    // Try to deduplicate existing direct room between the two users
    const existingDirect = await ctx.db
      .query('chatRooms')
      .withIndex('by_type', (q) => q.eq('type', 'direct'))
      .filter((q) => q.eq(q.field('isActive'), true))
      .collect();

    for (const room of existingDirect) {
      const embedded = room.embeddedParticipants || [];
      const hasBoth = embedded.some((p) => p.userId === currentUser._id) && embedded.some((p) => p.userId === otherIds[0]);
      if (hasBoth) {
        return room._id;
      }
    }
  }

  // Decide participant storage strategy
  const useEmbedded = chatType === 'direct' || requestedParticipantIds.length <= 10;

  const chatRoomId = await ctx.db.insert('chatRooms', {
    name,
    description,
    type: chatType,
    organizationId: args.organizationId,
    createdBy: currentUser._id,
    isActive: true,
    lastMessageAt: undefined,
    createdByInfo: {
      firstName: currentUser.firstName,
      lastName: currentUser.lastName,
      imageUrl: currentUser.imageUrl,
      email: currentUser.email,
    },
    embeddedParticipants: useEmbedded
      ? requestedParticipantIds.map((userId) => {
          const u = participants.find((x) => x._id === userId)!;
          return {
            userId: u._id,
            firstName: u.firstName,
            lastName: u.lastName,
            imageUrl: u.imageUrl,
            email: u.email,
            role: userId === currentUser._id ? (chatType === 'direct' ? 'member' : 'admin') : 'member',
            joinedAt: now,
            lastReadAt: undefined,
            isActive: true,
          };
        })
      : undefined,
    participantCount: requestedParticipantIds.length,
    unreadMessageCount: 0,
    lastMessagePreview: undefined,
    lastMessageSenderId: undefined,
    currentlyTyping: [],
    createdAt: now,
    updatedAt: now,
  });

  // If not using embedded, create chatParticipants rows
  if (!useEmbedded) {
    for (const user of participants) {
      await ctx.db.insert('chatParticipants', {
        chatRoomId,
        userId: user._id,
        userInfo: {
          firstName: user.firstName,
          lastName: user.lastName,
          imageUrl: user.imageUrl,
          email: user.email,
        },
        role: user._id === currentUser._id ? 'admin' : 'member',
        joinedAt: now,
        lastReadAt: undefined,
        isActive: true,
        notificationSettings: {
          mentions: true,
          allMessages: false,
          reactions: true,
        },
      });
    }
  }

  // Initialize room state
  await ctx.db.insert('chatRoomState', {
    chatRoomId,
    activeUsers: [],
    typingUsers: [],
    unreadCounts: requestedParticipantIds.map((uid) => ({
      userId: uid,
      count: 0,
      lastReadMessageId: undefined,
      lastReadAt: now,
    })),
    updatedAt: now,
  });

  // Optional first message
  if (args.initialMessage && args.initialMessage.trim().length > 0) {
    // Defer to sendMessage mutation pattern would be ideal, but we cannot call it directly here.
    await ctx.db.insert('chatMessages', {
      chatRoomId,
      senderId: currentUser._id,
      senderInfo: {
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        imageUrl: currentUser.imageUrl,
        email: currentUser.email,
      },
      content: sanitizeString(args.initialMessage),
      messageType: 'text',
      attachments: undefined,
      replyToId: undefined,
      replyToInfo: undefined,
      reactions: [],
      isEdited: false,
      editHistory: undefined,
      isDeleted: false,
      isPinned: false,
      readBy: [{ userId: currentUser._id, readAt: now }],
      mentions: [],
      createdAt: now,
      updatedAt: now,
    });

    // Update room last message info
    await ctx.db.patch(chatRoomId, {
      lastMessageAt: now,
      lastMessagePreview: sanitizeString(args.initialMessage).slice(0, 140),
      lastMessageSenderId: currentUser._id,
      updatedAt: now,
      unreadMessageCount: 1,
    });

    // Increment unread counts for others
    const state = await ctx.db
      .query('chatRoomState')
      .withIndex('by_chat_room', (q) => q.eq('chatRoomId', chatRoomId))
      .unique();
    if (state) {
      const updated = state.unreadCounts.map((uc) => (uc.userId === currentUser._id ? { ...uc, lastReadAt: now } : { ...uc, count: uc.count + 1 }));
      await ctx.db.patch(state._id, { unreadCounts: updated, updatedAt: now });
    }
  }

  await logAction(
    ctx,
    'create_chat_room',
    'DATA_CHANGE',
    'LOW',
    `Created chat room (${chatType}) ${name || 'unnamed'}`,
    currentUser._id,
    args.organizationId,
    { chatRoomId, participantCount: requestedParticipantIds.length, type: chatType }
  );

  return chatRoomId;
};
