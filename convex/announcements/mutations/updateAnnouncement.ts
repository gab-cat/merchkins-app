import { MutationCtx } from "../../_generated/server";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";
import {
  requireAuthentication,
  requireOrganizationPermission,
  sanitizeString,
  logAction,
} from "../../helpers";

export const updateAnnouncementArgs = {
  announcementId: v.id("announcements"),
  title: v.optional(v.string()),
  content: v.optional(v.string()),
  contentType: v.optional(
    v.union(v.literal("TEXT"), v.literal("MARKDOWN"), v.literal("HTML"))
  ),
  type: v.optional(v.union(v.literal("NORMAL"), v.literal("SYSTEM"))),
  level: v.optional(
    v.union(v.literal("INFO"), v.literal("WARNING"), v.literal("CRITICAL"))
  ),
  targetAudience: v.optional(
    v.union(
      v.literal("ALL"),
      v.literal("STAFF"),
      v.literal("CUSTOMERS"),
      v.literal("MERCHANTS"),
      v.literal("ADMINS")
    )
  ),
  category: v.optional(v.string()),
  visibility: v.optional(v.union(v.literal("PUBLIC"), v.literal("INTERNAL"))),
  isPinned: v.optional(v.boolean()),
  requiresAcknowledgment: v.optional(v.boolean()),
  attachments: v.optional(
    v.array(
      v.object({
        filename: v.string(),
        url: v.string(),
        size: v.number(),
        mimeType: v.string(),
      })
    )
  ),
  publishedAt: v.optional(v.number()),
  scheduledAt: v.optional(v.number()),
  expiresAt: v.optional(v.number()),
  isActive: v.optional(v.boolean()),
};

export const updateAnnouncementHandler = async (
  ctx: MutationCtx,
  args: {
    announcementId: Id<"announcements">;
    title?: string;
    content?: string;
    contentType?: "TEXT" | "MARKDOWN" | "HTML";
    type?: "NORMAL" | "SYSTEM";
    level?: "INFO" | "WARNING" | "CRITICAL";
    targetAudience?: "ALL" | "STAFF" | "CUSTOMERS" | "MERCHANTS" | "ADMINS";
    category?: string;
    visibility?: "PUBLIC" | "INTERNAL";
    isPinned?: boolean;
    requiresAcknowledgment?: boolean;
    attachments?: Array<{ filename: string; url: string; size: number; mimeType: string }>;
    publishedAt?: number;
    scheduledAt?: number;
    expiresAt?: number;
    isActive?: boolean;
  }
) => {
  const currentUser = await requireAuthentication(ctx);
  const existing = await ctx.db.get(args.announcementId);
  if (!existing) throw new Error("Announcement not found");

  if (existing.organizationId) {
    await requireOrganizationPermission(ctx, existing.organizationId, "MANAGE_ANNOUNCEMENTS", "update");
  } else if (!currentUser.isAdmin) {
    throw new Error("Only system administrators can update global announcements");
  }

  const updateData: Partial<typeof existing> = { updatedAt: Date.now() };

  if (args.title !== undefined) {
    const t = sanitizeString(args.title);
    if (!t) throw new Error("Title cannot be empty");
    updateData.title = t;
  }
  if (args.content !== undefined) {
    const c = sanitizeString(args.content);
    if (!c) throw new Error("Content cannot be empty");
    updateData.content = c;
  }
  if (args.contentType !== undefined) updateData.contentType = args.contentType;
  if (args.type !== undefined) updateData.type = args.type;
  if (args.level !== undefined) updateData.level = args.level;
  if (args.targetAudience !== undefined) updateData.targetAudience = args.targetAudience;
  if (args.category !== undefined) updateData.category = sanitizeString(args.category) || undefined;
  if (args.visibility !== undefined) updateData.visibility = args.visibility;
  if (args.isPinned !== undefined) updateData.isPinned = args.isPinned;
  if (args.requiresAcknowledgment !== undefined) updateData.requiresAcknowledgment = args.requiresAcknowledgment;
  if (args.attachments !== undefined) updateData.attachments = args.attachments;
  if (args.isActive !== undefined) updateData.isActive = args.isActive;

  // validate schedule consistency
  if (args.expiresAt !== undefined) updateData.expiresAt = args.expiresAt || undefined;
  if (args.publishedAt !== undefined) updateData.publishedAt = args.publishedAt || existing.createdAt;
  if (args.scheduledAt !== undefined) updateData.scheduledAt = args.scheduledAt || undefined;

  const publishedAt = updateData.publishedAt ?? existing.publishedAt;
  const scheduledAt = updateData.scheduledAt ?? existing.scheduledAt;
  const expiresAt = updateData.expiresAt ?? existing.expiresAt;
  if (expiresAt && publishedAt && expiresAt <= publishedAt) {
    throw new Error("expiresAt must be greater than publishedAt");
  }
  if (expiresAt && scheduledAt && expiresAt <= scheduledAt) {
    throw new Error("expiresAt must be greater than scheduledAt");
  }

  // Ensure global announcements remain PUBLIC; org PUBLIC may be restricted by permissions elsewhere
  if (!existing.organizationId) {
    updateData.visibility = "PUBLIC";
  }

  await ctx.db.patch(args.announcementId, updateData);

  await logAction(
    ctx,
    "update_announcement",
    "DATA_CHANGE",
    "LOW",
    `Updated announcement: ${existing.title}`,
    currentUser._id,
    existing.organizationId,
    { announcementId: args.announcementId, changes: Object.keys(updateData) }
  );

  return args.announcementId;
};


