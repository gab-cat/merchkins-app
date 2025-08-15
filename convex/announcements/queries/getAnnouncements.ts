import { QueryCtx } from "../../_generated/server";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";
import { requireAuthentication, requireOrganizationMember } from "../../helpers";

export const getAnnouncementsArgs = {
  organizationId: v.optional(v.id("organizations")),
  category: v.optional(v.string()),
  visibility: v.optional(v.union(v.literal("PUBLIC"), v.literal("INTERNAL"))),
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
  // Support both legacy offset-based pagination and new cursor-based pagination
  offset: v.optional(v.number()),
  cursor: v.optional(v.union(v.string(), v.null())),
};

export const getAnnouncementsHandler = async (
  ctx: QueryCtx,
  args: {
    organizationId?: Id<"organizations">;
    category?: string;
    visibility?: "PUBLIC" | "INTERNAL";
    targetAudience?: "ALL" | "STAFF" | "CUSTOMERS" | "MERCHANTS" | "ADMINS";
    level?: "INFO" | "WARNING" | "CRITICAL";
    includeInactive?: boolean;
    limit?: number;
    offset?: number;
    cursor?: string | null;
  }
) => {
  const user = await requireAuthentication(ctx);
  // Determine if user is an org admin anywhere to allow visibility of global admin-targeted announcements
  const memberships = await ctx.db
    .query("organizationMembers")
    .withIndex("by_user", (q) => q.eq("userId", user._id))
    .filter((q) => q.eq(q.field("isActive"), true))
    .collect();
  const isOrgAdminAnywhere = memberships.some((m) => m.role === "ADMIN");

  let query;
  if (args.organizationId) {
    // For organization announcements, require membership unless explicitly requesting PUBLIC ones
    if (args.visibility !== "PUBLIC") {
      await requireOrganizationMember(ctx, args.organizationId);
    }
    // Start from by_organization index and filter by optional visibility/category
    query = ctx.db
      .query("announcements")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId!));
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
    if (args.category !== undefined) conditions.push(q.eq(q.field("category"), args.category));
    if (args.visibility !== undefined) conditions.push(q.eq(q.field("visibility"), args.visibility));
    if (args.level !== undefined) conditions.push(q.eq(q.field("level"), args.level));
    if (args.targetAudience !== undefined) conditions.push(q.eq(q.field("targetAudience"), args.targetAudience));
    return conditions.length ? q.and(...conditions) : q.and();
  });

  const limit = Math.min(Math.max(args.limit ?? 50, 1), 200);
  const cursor = args.cursor ?? null;

  // We need to sort by pinned and publishedAt desc before paginating.
  // Since this combines multiple fields and complex audience gating below,
  // we will compute in memory then return cursor-based slices.
  const results = await filtered.collect();

  // visibility + audience gating
  const isStaffLike = user.isAdmin || user.isStaff;
  const isMerchant = !!user.isMerchant;
  const visible = results.filter((ann) => {
    // For org announcements: enforce INTERNAL visibility requires membership
    if (ann.organizationId && ann.visibility === "INTERNAL") {
      // We cannot query membership here without orgId; but this query is already scoped by org when provided.
      // If organizationId arg is not provided but announcement has orgId INTERNAL, hide unless user is member of that org.
      if (!args.organizationId) {
        return false;
      }
    }
    const allowed =
      ann.targetAudience === "ALL" ||
      (ann.targetAudience === "ADMINS" && (user.isAdmin || isOrgAdminAnywhere)) ||
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

  // Cursor is a simple numeric offset encoded as string for this in-memory path
  const start = cursor ? parseInt(cursor, 10) || 0 : 0;
  const end = start + limit;
  const page = visible.slice(start, end);
  const isDone = end >= visible.length;
  const continueCursor = isDone ? null : String(end);

  return { page, isDone, continueCursor } as any;
};


