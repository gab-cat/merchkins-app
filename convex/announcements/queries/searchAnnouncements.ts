import { QueryCtx } from "../../_generated/server";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";
import { requireAuthentication, requireOrganizationMember } from "../../helpers";

export const searchAnnouncementsArgs = {
  organizationId: v.optional(v.id("organizations")),
  query: v.string(),
  limit: v.optional(v.number()),
  offset: v.optional(v.number()),
};

export const searchAnnouncementsHandler = async (
  ctx: QueryCtx,
  args: { organizationId?: Id<"organizations">; query: string; limit?: number; offset?: number }
) => {
  const user = await requireAuthentication(ctx);
  const qLower = args.query.trim().toLowerCase();
  if (!qLower) return { announcements: [], total: 0, offset: 0, limit: args.limit || 50, hasMore: false };

  let query;
  if (args.organizationId) {
    await requireOrganizationMember(ctx, args.organizationId);
    query = ctx.db.query("announcements").withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId!));
  } else {
    query = ctx.db.query("announcements").withIndex("by_published_at").filter((q) => q.eq(q.field("organizationId"), undefined));
  }

  const now = Date.now();
  const base = await query
    .filter((q) =>
      q.and(
        q.eq(q.field("isActive"), true),
        q.lte(q.field("publishedAt"), now),
        q.or(q.eq(q.field("scheduledAt"), undefined), q.lte(q.field("scheduledAt"), now)),
        q.or(q.eq(q.field("expiresAt"), undefined), q.gt(q.field("expiresAt"), now))
      )
    )
    .collect();

  const isStaffLike = user.isAdmin || user.isStaff;
  const isMerchant = !!user.isMerchant;
  const visible = base.filter((ann) => {
    const allowed =
      ann.targetAudience === "ALL" ||
      (ann.targetAudience === "ADMINS" && user.isAdmin) ||
      (ann.targetAudience === "STAFF" && isStaffLike) ||
      (ann.targetAudience === "MERCHANTS" && isMerchant) ||
      (ann.targetAudience === "CUSTOMERS" && !isStaffLike);
    if (!allowed) return false;
    const haystack = `${ann.title} ${ann.content}`.toLowerCase();
    return haystack.includes(qLower);
  });

  visible.sort((a, b) => (b.publishedAt || 0) - (a.publishedAt || 0));
  const total = visible.length;
  const offset = args.offset || 0;
  const limit = args.limit || 50;
  const page = visible.slice(offset, offset + limit);
  return { announcements: page, total, offset, limit, hasMore: offset + limit < total };
};


