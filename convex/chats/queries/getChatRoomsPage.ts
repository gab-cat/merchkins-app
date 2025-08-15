import { QueryCtx } from "../../_generated/server";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";
import { requireAuthentication } from "../../helpers";

export const getChatRoomsPageArgs = {
  organizationId: v.optional(v.id("organizations")),
  limit: v.optional(v.number()),
  cursor: v.optional(v.string()),
};

export const getChatRoomsPageHandler = async (
  ctx: QueryCtx,
  args: { organizationId?: Id<"organizations">; limit?: number; cursor?: string | null }
) => {
  const currentUser = await requireAuthentication(ctx);

  // Start from active rooms; we will filter membership after pagination for simplicity
  let base = ctx.db.query("chatRooms").withIndex("by_active", (q) => q.eq("isActive", true));
  if (args.organizationId) {
    base = base.filter((q) => q.eq(q.field("organizationId"), args.organizationId));
  }

  const limit = Math.min(Math.max(args.limit ?? 25, 1), 200);
  const cursor = args.cursor ?? null;

  const page = await base.order("desc").paginate({ numItems: limit, cursor });

  // Filter to rooms the user is a member of
  const membershipFiltered = [] as any[];
  for (const r of page.page) {
    const isMember = (r.embeddedParticipants || []).some((p: any) => p.userId === currentUser._id && p.isActive);
    if (isMember) membershipFiltered.push(r);
  }

  return {
    page: membershipFiltered,
    isDone: page.isDone,
    continueCursor: page.continueCursor,
  } as any;
};


