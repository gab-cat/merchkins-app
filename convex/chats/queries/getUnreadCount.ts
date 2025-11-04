import { QueryCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';
import { requireAuthentication } from '../../helpers';

export const getUnreadCountArgs = {
  organizationId: v.optional(v.id('organizations')),
};

export const getUnreadCountHandler = async (ctx: QueryCtx, args: { organizationId?: Id<'organizations'> }) => {
  const currentUser = await requireAuthentication(ctx);

  // Rooms where user is embedded participant
  const embeddedRooms = await ctx.db
    .query('chatRooms')
    .withIndex('by_active', (q) => q.eq('isActive', true))
    .collect();
  const userRooms = embeddedRooms.filter((r) => (r.embeddedParticipants || []).some((p) => p.userId === currentUser._id && p.isActive));

  // Rooms where user is in participants table
  const participantMemberships = await ctx.db
    .query('chatParticipants')
    .withIndex('by_user', (q) => q.eq('userId', currentUser._id))
    .filter((q) => q.eq(q.field('isActive'), true))
    .collect();
  const participantRoomIds = new Set(participantMemberships.map((m) => m.chatRoomId));
  const participantRooms = await Promise.all(Array.from(participantRoomIds).map((roomId) => ctx.db.get(roomId)));

  // Merge and filter by organization if provided
  const allRooms = [...userRooms, ...participantRooms.filter(Boolean)];
  const rooms = (args.organizationId ? allRooms.filter((r) => r && r.organizationId === args.organizationId) : allRooms).filter(
    (r) => r && r.isActive
  );

  let total = 0;
  for (const room of rooms) {
    const state = await ctx.db
      .query('chatRoomState')
      .withIndex('by_chat_room', (q) => q.eq('chatRoomId', room!._id))
      .unique();
    if (!state) continue;
    const entry = state.unreadCounts.find((u) => u.userId === currentUser._id);
    total += entry ? entry.count : 0;
  }

  return { count: total };
};
