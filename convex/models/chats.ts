import { defineTable } from 'convex/server';
import { v } from 'convex/values';

// Optimized Chat rooms/conversations with embedded participant data for small groups
export const chatRooms = defineTable({
  name: v.optional(v.string()),
  description: v.optional(v.string()),
  type: v.union(v.literal('direct'), v.literal('group'), v.literal('public')),
  organizationId: v.optional(v.id('organizations')),
  createdBy: v.id('users'),
  isActive: v.boolean(),
  lastMessageAt: v.optional(v.number()),

  createdByInfo: v.object({
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    email: v.string(),
  }),

  // Embedded participants for direct messages only
  // For larger groups, use separate chatParticipants table
  embeddedParticipants: v.optional(
    v.array(
      v.object({
        userId: v.id('users'),
        firstName: v.optional(v.string()),
        lastName: v.optional(v.string()),
        imageUrl: v.optional(v.string()),
        email: v.string(),
        role: v.union(v.literal('admin'), v.literal('moderator'), v.literal('member')),
        joinedAt: v.number(),
        lastReadAt: v.optional(v.number()),
        isActive: v.boolean(),
      })
    )
  ),

  // Metadata for quick access
  participantCount: v.number(),
  unreadMessageCount: v.number(),
  lastMessagePreview: v.optional(v.string()),
  lastMessageSenderId: v.optional(v.id('users')),

  // Current typing users (for real-time updates)
  currentlyTyping: v.array(
    v.object({
      userId: v.id('users'),
      firstName: v.optional(v.string()),
      lastTypingAt: v.number(),
    })
  ),

  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index('by_organization', ['organizationId'])
  .index('by_type', ['type'])
  .index('by_created_by', ['createdBy'])
  .index('by_active', ['isActive'])
  .index('by_last_message', ['lastMessageAt'])
  .index('by_organization_active', ['organizationId', 'isActive'])
  .index('by_participant_count', ['participantCount']);

// Separate participants table only for large group chats (>10 members)
export const chatParticipants = defineTable({
  chatRoomId: v.id('chatRooms'),
  userId: v.id('users'),

  // Embedded user info to avoid joins
  userInfo: v.object({
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    email: v.string(),
  }),

  role: v.union(v.literal('admin'), v.literal('moderator'), v.literal('member')),
  joinedAt: v.number(),
  lastReadAt: v.optional(v.number()),
  isActive: v.boolean(),

  // Notification preferences
  notificationSettings: v.object({
    mentions: v.boolean(),
    allMessages: v.boolean(),
    reactions: v.boolean(),
  }),
})
  .index('by_chat_room', ['chatRoomId'])
  .index('by_user', ['userId'])
  .index('by_chat_and_user', ['chatRoomId', 'userId'])
  .index('by_active', ['isActive'])
  .index('by_chat_active', ['chatRoomId', 'isActive']);

// Optimized Chat messages with embedded user info and reactions
export const chatMessages = defineTable({
  chatRoomId: v.id('chatRooms'),
  senderId: v.id('users'),

  // Embedded sender info to avoid joins
  senderInfo: v.object({
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    email: v.string(),
  }),

  content: v.string(),
  messageType: v.union(v.literal('text'), v.literal('image'), v.literal('file'), v.literal('system'), v.literal('announcement')),

  // Attachment data
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

  // Thread/reply data
  replyToId: v.optional(v.id('chatMessages')),
  replyToInfo: v.optional(
    v.object({
      content: v.string(),
      senderId: v.id('users'),
      senderName: v.string(),
    })
  ),

  // Embedded reactions for better performance
  reactions: v.array(
    v.object({
      emoji: v.string(),
      users: v.array(
        v.object({
          userId: v.id('users'),
          firstName: v.optional(v.string()),
          createdAt: v.number(),
        })
      ),
      count: v.number(),
    })
  ),

  // Message metadata
  isEdited: v.boolean(),
  editHistory: v.optional(
    v.array(
      v.object({
        content: v.string(),
        editedAt: v.number(),
      })
    )
  ),

  isDeleted: v.boolean(),
  isPinned: v.boolean(),

  // Read status optimization
  readBy: v.array(
    v.object({
      userId: v.id('users'),
      readAt: v.number(),
    })
  ),

  // Mentions
  mentions: v.array(v.id('users')),

  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index('by_chat_room', ['chatRoomId'])
  .index('by_sender', ['senderId'])
  .index('by_chat_and_created', ['chatRoomId', 'createdAt'])
  .index('by_reply_to', ['replyToId'])
  .index('by_deleted', ['isDeleted'])
  .index('by_chat_not_deleted', ['chatRoomId', 'isDeleted'])
  .index('by_mentions', ['mentions'])
  .index('by_pinned', ['isPinned'])
  .index('by_chat_pinned', ['chatRoomId', 'isPinned']);

// Separate table for message reactions only if embedded reactions become too large
// This is optional and can be used for high-volume chats
export const messageReactions = defineTable({
  messageId: v.id('chatMessages'),
  userId: v.id('users'),
  emoji: v.string(),

  // Embedded user info
  userInfo: v.object({
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  }),

  createdAt: v.number(),
})
  .index('by_message', ['messageId'])
  .index('by_user', ['userId'])
  .index('by_message_and_user', ['messageId', 'userId'])
  .index('by_emoji', ['emoji']);

// Consolidated chat room state for real-time features
export const chatRoomState = defineTable({
  chatRoomId: v.id('chatRooms'),

  // Active users in the chat room
  activeUsers: v.array(
    v.object({
      userId: v.id('users'),
      firstName: v.optional(v.string()),
      imageUrl: v.optional(v.string()),
      lastSeenAt: v.number(),
      isOnline: v.boolean(),
    })
  ),

  // Currently typing users
  typingUsers: v.array(
    v.object({
      userId: v.id('users'),
      firstName: v.optional(v.string()),
      startedTypingAt: v.number(),
    })
  ),

  // Unread message counts per user
  unreadCounts: v.array(
    v.object({
      userId: v.id('users'),
      count: v.number(),
      lastReadMessageId: v.optional(v.id('chatMessages')),
      lastReadAt: v.number(),
    })
  ),

  updatedAt: v.number(),
}).index('by_chat_room', ['chatRoomId']);
