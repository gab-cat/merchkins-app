import { QueryCtx } from "../../_generated/server";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";
import { requireAuthentication, requireOrganizationMember } from "../../helpers";

export const getAnnouncementByIdArgs = {
  announcementId: v.id("announcements"),
};

export const getAnnouncementByIdHandler = async (
  ctx: QueryCtx,
  args: { announcementId: Id<"announcements"> }
) => {
  const user = await requireAuthentication(ctx);
  const ann = await ctx.db.get(args.announcementId);
  if (!ann || !ann.isActive) return null;

  const now = Date.now();
  const isPublished = (ann.publishedAt ?? 0) <= now && (!ann.scheduledAt || ann.scheduledAt <= now);
  const notExpired = !ann.expiresAt || ann.expiresAt > now;
  if (!(isPublished && notExpired)) return null;

  if (ann.organizationId) {
    await requireOrganizationMember(ctx, ann.organizationId);
  }

  // Basic audience gating: allow admins/staff always; others see ALL/CUSTOMERS/MERCHANTS depending on profile
  const isStaffLike = user.isAdmin || user.isStaff;
  const isMerchant = !!user.isMerchant;
  const allowed =
    ann.targetAudience === "ALL" ||
    (ann.targetAudience === "ADMINS" && user.isAdmin) ||
    (ann.targetAudience === "STAFF" && isStaffLike) ||
    (ann.targetAudience === "MERCHANTS" && isMerchant) ||
    (ann.targetAudience === "CUSTOMERS" && !isStaffLike);
  if (!allowed) return null;

  return ann;
};


