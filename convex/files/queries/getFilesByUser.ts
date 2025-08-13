import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";
import { QueryCtx } from "../../_generated/server";
import { requireAuthentication } from "../../helpers";

// Get files by user
export const getFilesByUserArgs = {
  userId: v.optional(v.id("users")),
  fileType: v.optional(v.string()),
  usageType: v.optional(v.string()),
  limit: v.optional(v.number()),
};

export const getFilesByUserHandler = async (
  ctx: QueryCtx,
  args: {
    userId?: Id<"users">;
    fileType?: string;
    usageType?: string;
    limit?: number;
  }
) => {
  const currentUser = await requireAuthentication(ctx);
  const targetUserId = args.userId || currentUser._id;

  // Only allow users to see their own files unless they're admin
  if (targetUserId !== currentUser._id && !currentUser.isAdmin) {
    throw new Error("Access denied: You can only view your own files");
  }

  let query = ctx.db
    .query("files")
    .withIndex("by_uploader", (q) => q.eq("uploadedById", targetUserId))
    .filter((q) => q.eq(q.field("isActive"), true));

  if (args.fileType) {
    query = query.filter((q) => q.eq(q.field("fileType"), args.fileType));
  }

  if (args.usageType) {
    query = query.filter((q) => q.eq(q.field("usageType"), args.usageType));
  }

  const files = await query
    .order("desc")
    .take(args.limit || 50);

  return files.map((file) => ({
    _id: file._id,
    fileName: file.fileName,
    originalName: file.originalName,
    fileType: file.fileType,
    mimeType: file.mimeType,
    fileSize: file.fileSize,
    url: file.url,
    usageType: file.usageType,
    relatedEntityId: file.relatedEntityId,
    relatedEntityType: file.relatedEntityType,
    imageMetadata: file.imageMetadata,
    isPublic: file.isPublic,
    accessLevel: file.accessLevel,
    createdAt: file.createdAt,
    updatedAt: file.updatedAt,
  }));
};
