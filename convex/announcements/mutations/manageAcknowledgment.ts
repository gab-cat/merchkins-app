import { MutationCtx } from "../../_generated/server";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";
import { requireAuthentication, requireOrganizationMember, logAction } from "../../helpers";

export const acknowledgeAnnouncementArgs = {
  announcementId: v.id("announcements"),
};

export const acknowledgeAnnouncementHandler = async (
  ctx: MutationCtx,
  args: { announcementId: Id<"announcements"> }
) => {
  const currentUser = await requireAuthentication(ctx);
  const announcement = await ctx.db.get(args.announcementId);
  if (!announcement || !announcement.isActive) {
    throw new Error("Announcement not found or inactive");
  }

  // Ensure membership when organization-scoped
  if (announcement.organizationId) {
    await requireOrganizationMember(ctx, announcement.organizationId);
  }

  // Idempotent acknowledgment
  const already = (announcement.acknowledgedBy || []).some((a) => a.userId === currentUser._id);
  if (!already) {
    const updated = {
      acknowledgedBy: [
        ...announcement.acknowledgedBy,
        {
          userId: currentUser._id,
          userName: `${currentUser.firstName || ""} ${currentUser.lastName || ""}`.trim() || currentUser.email,
          acknowledgedAt: Date.now(),
        },
      ],
      updatedAt: Date.now(),
    } as Partial<typeof announcement>;

    await ctx.db.patch(args.announcementId, updated);

    await logAction(
      ctx,
      "acknowledge_announcement",
      "USER_ACTION",
      "LOW",
      `Acknowledged announcement ${args.announcementId}`,
      currentUser._id,
      announcement.organizationId,
      { announcementId: args.announcementId }
    );
  }

  return { acknowledged: true };
};


