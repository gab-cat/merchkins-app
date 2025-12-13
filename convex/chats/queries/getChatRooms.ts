import { QueryCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';
import { requireAuthentication } from '../../helpers';

export const getChatRoomsArgs = {
  organizationId: v.optional(v.id('organizations')),
  search: v.optional(v.string()),
};

export const getChatRoomsHandler = async (ctx: QueryCtx, args: { organizationId?: Id<'organizations'>; search?: string }) => {
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

  const allRooms = [...userRooms, ...participantRooms.filter(Boolean)];

  const filtered = args.organizationId ? allRooms.filter((r) => r && r.organizationId === args.organizationId) : allRooms;

  // Remove duplicates
  const byId = new Map(filtered.filter(Boolean).map((r) => [r!._id, r!]));
  let result = Array.from(byId.values())
    .filter((r) => r.isActive)
    .sort((a, b) => (b.lastMessageAt || 0) - (a.lastMessageAt || 0));

  // Apply search filter if provided
  if (args.search && args.search.trim()) {
    const searchTerm = args.search.toLowerCase().trim();
    result = result.filter((r) => {
      const name = (r.name || '').toLowerCase();
      return name.includes(searchTerm);
    });
  }

  return result;
};
