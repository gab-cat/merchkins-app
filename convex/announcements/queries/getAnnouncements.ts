import { QueryCtx } from "../../_generated/server";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";
import { requireAuthentication, requireOrganizationMember } from "../../helpers";

export const getAnnouncementsArgs = {
  organizationId: v.optional(v.id("organizations")),
  targetAudience: v.optional(
    v.union(
      v.literal("ALL"),
      v.literal("STAFF"),
      v.literal("CUSTOMERS"),
      v.literal("MERCHANTS"),
      v.literal("ADMINS")
    )
  ),
  level: v.optional(v.union(v.literal("INFO"), v.literal("WARNING"), v.literal("CRITICAL"))),
  includeInactive: v.optional(v.boolean()),
  limit: v.optional(v.number()),
  offset: v.optional(v.number()),
};

export const getAnnouncementsHandler = async (
  ctx: QueryCtx,
  args: {
    organizationId?: Id<"organizations">;
    targetAudience?: "ALL" | "STAFF" | "CUSTOMERS" | "MERCHANTS" | "ADMINS";
    level?: "INFO" | "WARNING" | "CRITICAL";
    includeInactive?: boolean;
    limit?: number;
    offset?: number;
  }
) => {
  const user = await requireAuthentication(ctx);

  let query;
  if (args.organizationId) {
    await requireOrganizationMember(ctx, args.organizationId);
    query = ctx.db.query("announcements").withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId!));
  } else {
    // Global announcements (organizationId is undefined)
    query = ctx.db
      .query("announcements")
      .withIndex("by_published_at")
      .filter((q) => q.eq(q.field("organizationId"), undefined));
  }

  const now = Date.now();
  const filtered = query.filter((q) => {
    const conditions = [] as Array<any>;
    if (!args.includeInactive) conditions.push(q.eq(q.field("isActive"), true));
    // publication window
    conditions.push(q.lte(q.field("publishedAt"), now));
    conditions.push(q.or(q.eq(q.field("scheduledAt"), undefined), q.lte(q.field("scheduledAt"), now)));
    conditions.push(q.or(q.eq(q.field("expiresAt"), undefined), q.gt(q.field("expiresAt"), now)));
    if (args.level !== undefined) conditions.push(q.eq(q.field("level"), args.level));
    if (args.targetAudience !== undefined) conditions.push(q.eq(q.field("targetAudience"), args.targetAudience));
    return conditions.length ? q.and(...conditions) : q.and();
  });

  const results = await filtered.collect();

  // audience gating
  const isStaffLike = user.isAdmin || user.isStaff;
  const isMerchant = !!user.isMerchant;
  const visible = results.filter((ann) => {
    const allowed =
      ann.targetAudience === "ALL" ||
      (ann.targetAudience === "ADMINS" && user.isAdmin) ||
      (ann.targetAudience === "STAFF" && isStaffLike) ||
      (ann.targetAudience === "MERCHANTS" && isMerchant) ||
      (ann.targetAudience === "CUSTOMERS" && !isStaffLike);
    return allowed;
  });

  // Sort by pinned desc then publishedAt desc
  visible.sort((a, b) => {
    if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
    return (b.publishedAt || 0) - (a.publishedAt || 0);
  });

  const total = visible.length;
  const offset = args.offset || 0;
  const limit = args.limit || 50;
  const page = visible.slice(offset, offset + limit);

  return { announcements: page, total, offset, limit, hasMore: offset + limit < total };
};


