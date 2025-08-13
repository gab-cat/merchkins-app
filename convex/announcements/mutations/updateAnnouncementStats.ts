import { MutationCtx } from "../../_generated/server";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";

export const updateAnnouncementStatsArgs = {
  announcementId: v.id("announcements"),
  incrementView: v.optional(v.boolean()),
  incrementClick: v.optional(v.boolean()),
  incrementDismiss: v.optional(v.boolean()),
};

export const updateAnnouncementStatsHandler = async (
  ctx: MutationCtx,
  args: {
    announcementId: Id<"announcements">;
    incrementView?: boolean;
    incrementClick?: boolean;
    incrementDismiss?: boolean;
  }
) => {
  const existing = await ctx.db.get(args.announcementId);
  if (!existing) return null;

  const update: Partial<typeof existing> = { updatedAt: Date.now() };
  if (args.incrementView) update.viewCount = (existing.viewCount || 0) + 1;
  if (args.incrementClick) update.clickCount = (existing.clickCount || 0) + 1;
  if (args.incrementDismiss) update.dismissCount = (existing.dismissCount || 0) + 1;

  await ctx.db.patch(args.announcementId, update);
  return null;
};


