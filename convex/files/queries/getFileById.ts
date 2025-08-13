import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";
import { QueryCtx } from "../../_generated/server";
import { requireAuthentication } from "../../helpers";

// Get file by ID
export const getFileByIdArgs = {
  fileId: v.id("files"),
};

export const getFileByIdHandler = async (
  ctx: QueryCtx,
  args: {
    fileId: Id<"files">;
  }
) => {
  const file = await ctx.db.get(args.fileId);
  
  if (!file || !file.isActive) {
    return null;
  }

  // Check if file is public or user has access
  if (!file.isPublic) {
    try {
      const currentUser = await requireAuthentication(ctx);
      
      // Allow access if user owns the file or is admin
      if (file.uploadedById !== currentUser._id && !currentUser.isAdmin) {
        // For organization-level files, check if user is in the organization
        if (file.accessLevel === "organization" && file.organizationId) {
          // This would require organization membership check
          // For now, we'll restrict to owner and admin only
          return null;
        } else {
          return null;
        }
      }
    } catch {
      return null;
    }
  }

  return {
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
  };
};