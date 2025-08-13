import { QueryCtx } from "../../_generated/server";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";
import { requireAuthentication } from "../../helpers";

export const searchChatsArgs = {
  query: v.string(),
  organizationId: v.optional(v.id("organizations")),
};

export const searchChatsHandler = async (
  ctx: QueryCtx,
  args: { query: string; organizationId?: Id<"organizations"> }
) => {
  const currentUser = await requireAuthentication(ctx);
  const q = args.query.trim().toLowerCase();
  if (q.length === 0) return [];

  // Fetch candidate rooms where user is a participant
  const rooms = await ctx.db
    .query("chatRooms")
    .withIndex("by_active", (q) => q.eq("isActive", true))
    .collect();

  const memberships = await ctx.db
    .query("chatParticipants")
    .withIndex("by_user", (q) => q.eq("userId", currentUser._id))
    .filter((q) => q.eq(q.field("isActive"), true))
    .collect();
  const membershipRoomIds = new Set(memberships.map((m) => m.chatRoomId));

  const accessible = rooms.filter((r) => {
    const isMember = (r.embeddedParticipants || []).some((p) => p.userId === currentUser._id && p.isActive) || membershipRoomIds.has(r._id);
    if (!isMember) return false;
    if (args.organizationId && r.organizationId !== args.organizationId) return false;
    return true;
  });

  // Simple in-memory search across room name/description and lastMessagePreview
  const results = accessible.filter((r) => {
    const hay = `${r.name || ""} ${r.description || ""} ${r.lastMessagePreview || ""}`.toLowerCase();
    return hay.includes(q);
  });

  return results.slice(0, 50);
};


