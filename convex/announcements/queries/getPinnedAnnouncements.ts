import { QueryCtx } from "../../_generated/server";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";
import { requireAuthentication, requireOrganizationMember } from "../../helpers";

export const getPinnedAnnouncementsArgs = {
  organizationId: v.optional(v.id("organizations")),
};

export const getPinnedAnnouncementsHandler = async (
  ctx: QueryCtx,
  args: { organizationId?: Id<"organizations"> }
) => {
  const user = await requireAuthentication(ctx);
  let query;
  const now = Date.now();

  if (args.organizationId) {
    await requireOrganizationMember(ctx, args.organizationId);
    query = ctx.db
      .query("announcements")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId!));
  } else {
    query = ctx.db
      .query("announcements")
      .withIndex("by_pinned", (q) => q.eq("isPinned", true))
      .filter((q) => q.eq(q.field("organizationId"), undefined));
  }

  const results = await query
    .filter((q) =>
      q.and(
        q.eq(q.field("isPinned"), true),
        q.eq(q.field("isActive"), true),
        q.lte(q.field("publishedAt"), now),
        q.or(q.eq(q.field("scheduledAt"), undefined), q.lte(q.field("scheduledAt"), now)),
        q.or(q.eq(q.field("expiresAt"), undefined), q.gt(q.field("expiresAt"), now))
      )
    )
    .collect();

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

  visible.sort((a, b) => (b.publishedAt || 0) - (a.publishedAt || 0));
  return visible;
};


