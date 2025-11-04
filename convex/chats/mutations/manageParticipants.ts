import { MutationCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id, Doc } from '../../_generated/dataModel';
import { requireAuthentication, validateUserExists, logAction } from '../../helpers';

export const addParticipantsArgs = {
  chatRoomId: v.id('chatRooms'),
  userIds: v.array(v.id('users')),
};

export const removeParticipantsArgs = {
  chatRoomId: v.id('chatRooms'),
  userIds: v.array(v.id('users')),
};

export const addParticipantsHandler = async (ctx: MutationCtx, args: { chatRoomId: Id<'chatRooms'>; userIds: Array<Id<'users'>> }) => {
  const currentUser = await requireAuthentication(ctx);
  const chatRoom = await ctx.db.get(args.chatRoomId);
  if (!chatRoom || !chatRoom.isActive) {
    throw new Error('Chat room not found or inactive');
  }

  if (chatRoom.type === 'direct') {
    throw new Error('Cannot add participants to a direct chat');
  }

  // Require admin or moderator role in this room (embedded or via participants)
  const embeddedRole = (chatRoom.embeddedParticipants || []).find((p) => p.userId === currentUser._id)?.role;
  let isPrivileged = embeddedRole === 'admin' || embeddedRole === 'moderator';
  if (!isPrivileged) {
    const membership = await ctx.db
      .query('chatParticipants')
      .withIndex('by_chat_and_user', (q) => q.eq('chatRoomId', args.chatRoomId).eq('userId', currentUser._id))
      .first();
    isPrivileged = !!membership && (membership.role === 'admin' || membership.role === 'moderator');
  }
  if (!isPrivileged) {
    throw new Error('Only admins or moderators can add participants');
  }

  const now = Date.now();

  // Validate users and deduplicate
  const uniqueUserIds = Array.from(new Set(args.userIds));
  const usersToAdd: Record<string, Doc<'users'>> = {};
  for (const uid of uniqueUserIds) {
    const user = await validateUserExists(ctx, uid);
    usersToAdd[uid] = user;
  }

  // Update embedded participants if present and room is small
  const embedded = chatRoom.embeddedParticipants || [];
  const embeddedIds = new Set(embedded.map((p) => p.userId));
  const newEmbedded = [...embedded];
  for (const uid of uniqueUserIds) {
    if (!embeddedIds.has(uid) && embedded.length + uniqueUserIds.length <= 10) {
      const u = usersToAdd[uid];
      newEmbedded.push({
        userId: uid,
        firstName: u.firstName,
        lastName: u.lastName,
        imageUrl: u.imageUrl,
        email: u.email,
        role: 'member',
        joinedAt: now,
        lastReadAt: undefined,
        isActive: true,
      });
    }
  }

  if (newEmbedded.length !== embedded.length) {
    await ctx.db.patch(args.chatRoomId, {
      embeddedParticipants: newEmbedded,
      participantCount: Math.max(chatRoom.participantCount, newEmbedded.length),
      updatedAt: now,
    });
  }

  // Add to chatParticipants table regardless to support large rooms
  for (const uid of uniqueUserIds) {
    const existing = await ctx.db
      .query('chatParticipants')
      .withIndex('by_chat_and_user', (q) => q.eq('chatRoomId', args.chatRoomId).eq('userId', uid))
      .first();
    if (!existing) {
      await ctx.db.insert('chatParticipants', {
        chatRoomId: args.chatRoomId,
        userId: uid,
        userInfo: {
          firstName: usersToAdd[uid].firstName,
          lastName: usersToAdd[uid].lastName,
          imageUrl: usersToAdd[uid].imageUrl,
          email: usersToAdd[uid].email,
        },
        role: 'member',
        joinedAt: now,
        lastReadAt: undefined,
        isActive: true,
        notificationSettings: { mentions: true, allMessages: false, reactions: true },
      });
    } else if (!existing.isActive) {
      await ctx.db.patch(existing._id, { isActive: true });
    }
  }

  // Update room state unread entries
  const state = await ctx.db
    .query('chatRoomState')
    .withIndex('by_chat_room', (q) => q.eq('chatRoomId', args.chatRoomId))
    .unique();
  if (state) {
    const stateIds = new Set(state.unreadCounts.map((u) => u.userId));
    const additional = uniqueUserIds
      .filter((uid) => !stateIds.has(uid))
      .map((uid) => ({ userId: uid, count: 0, lastReadMessageId: undefined, lastReadAt: now }));
    if (additional.length > 0) {
      await ctx.db.patch(state._id, {
        unreadCounts: [...state.unreadCounts, ...additional],
        updatedAt: now,
      });
    }
  }

  await logAction(
    ctx,
    'add_chat_participants',
    'DATA_CHANGE',
    'LOW',
    `Added ${uniqueUserIds.length} participants to room ${args.chatRoomId}`,
    currentUser._id,
    chatRoom.organizationId,
    { chatRoomId: args.chatRoomId, addedUserIds: uniqueUserIds }
  );

  return true;
};

export const removeParticipantsHandler = async (ctx: MutationCtx, args: { chatRoomId: Id<'chatRooms'>; userIds: Array<Id<'users'>> }) => {
  const currentUser = await requireAuthentication(ctx);
  const chatRoom = await ctx.db.get(args.chatRoomId);
  if (!chatRoom || !chatRoom.isActive) {
    throw new Error('Chat room not found or inactive');
  }

  // Require admin or moderator role
  const embeddedRole = (chatRoom.embeddedParticipants || []).find((p) => p.userId === currentUser._id)?.role;
  let isPrivileged = embeddedRole === 'admin' || embeddedRole === 'moderator';
  if (!isPrivileged) {
    const membership = await ctx.db
      .query('chatParticipants')
      .withIndex('by_chat_and_user', (q) => q.eq('chatRoomId', args.chatRoomId).eq('userId', currentUser._id))
      .first();
    isPrivileged = !!membership && (membership.role === 'admin' || membership.role === 'moderator');
  }
  if (!isPrivileged) {
    throw new Error('Only admins or moderators can remove participants');
  }

  const uniqueUserIds = Array.from(new Set(args.userIds));
  const now = Date.now();

  // Update embedded participants
  if (chatRoom.embeddedParticipants && chatRoom.embeddedParticipants.length > 0) {
    const filtered = chatRoom.embeddedParticipants.filter((p) => !uniqueUserIds.includes(p.userId));
    if (filtered.length !== chatRoom.embeddedParticipants.length) {
      await ctx.db.patch(args.chatRoomId, {
        embeddedParticipants: filtered,
        participantCount: Math.max(filtered.length, chatRoom.participantCount - uniqueUserIds.length),
        updatedAt: now,
      });
    }
  }

  // Deactivate in chatParticipants
  for (const uid of uniqueUserIds) {
    const membership = await ctx.db
      .query('chatParticipants')
      .withIndex('by_chat_and_user', (q) => q.eq('chatRoomId', args.chatRoomId).eq('userId', uid))
      .first();
    if (membership && membership.isActive) {
      await ctx.db.patch(membership._id, { isActive: false });
    }
  }

  // Update room state unread entries
  const state = await ctx.db
    .query('chatRoomState')
    .withIndex('by_chat_room', (q) => q.eq('chatRoomId', args.chatRoomId))
    .unique();
  if (state) {
    const remaining = state.unreadCounts.filter((u) => !uniqueUserIds.includes(u.userId));
    if (remaining.length !== state.unreadCounts.length) {
      await ctx.db.patch(state._id, { unreadCounts: remaining, updatedAt: now });
    }
  }

  await logAction(
    ctx,
    'remove_chat_participants',
    'DATA_CHANGE',
    'LOW',
    `Removed ${uniqueUserIds.length} participants from room ${args.chatRoomId}`,
    currentUser._id,
    chatRoom.organizationId,
    { chatRoomId: args.chatRoomId, removedUserIds: uniqueUserIds }
  );

  return true;
};
