import { QueryCtx } from "../../_generated/server";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";
import { requireAuthentication, requireOrganizationPermission } from "../../helpers";

export const getAnnouncementAnalyticsArgs = {
  organizationId: v.optional(v.id("organizations")),
};

export const getAnnouncementAnalyticsHandler = async (
  ctx: QueryCtx,
  args: { organizationId?: Id<"organizations"> }
) => {
  const user = await requireAuthentication(ctx);
  if (args.organizationId) {
    await requireOrganizationPermission(ctx, args.organizationId, "MANAGE_ANNOUNCEMENTS", "read");
  } else if (!user.isAdmin) {
    throw new Error("Only system administrators can view global announcement analytics");
  }

  let query;
  if (args.organizationId) {
    query = ctx.db.query("announcements").withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId!));
  } else {
    query = ctx.db.query("announcements").withIndex("by_published_at", (q) => q.eq("publishedAt", 0)).filter((q) => q.or());
  }

  const rows = await query.collect();
  const total = rows.length;
  const active = rows.filter((r) => r.isActive).length;
  const pinned = rows.filter((r) => r.isPinned).length;
  const byLevel: Record<string, number> = { INFO: 0, WARNING: 0, CRITICAL: 0 };
  for (const r of rows) byLevel[r.level] = (byLevel[r.level] || 0) + 1;
  const views = rows.reduce((sum, r) => sum + (r.viewCount || 0), 0);
  const clicks = rows.reduce((sum, r) => sum + (r.clickCount || 0), 0);
  const dismisses = rows.reduce((sum, r) => sum + (r.dismissCount || 0), 0);
  const ackRequired = rows.filter((r) => r.requiresAcknowledgment).length;
  const ackTotal = rows.reduce((sum, r) => sum + (r.acknowledgedBy?.length || 0), 0);

  return {
    total,
    active,
    pinned,
    byLevel,
    views,
    clicks,
    dismisses,
    ackRequired,
    ackTotal,
  };
};


