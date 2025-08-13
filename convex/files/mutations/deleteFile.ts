import { v } from "convex/values";
import { MutationCtx } from "../../_generated/server";
import { requireAuthentication, logAction } from "../../helpers";
import { r2 } from "../r2";

// Delete file from R2 and database
export const deleteFileArgs = {
  key: v.string(),
};

export const deleteFileHandler = async (
  ctx: MutationCtx,
  args: {
    key: string;
  }
) => {
  // Require authentication
  const currentUser = await requireAuthentication(ctx);

  // Get file metadata from R2 component
  const metadata = await r2.getMetadata(ctx, args.key);
  if (!metadata) {
    throw new Error("File not found");
  }

  // Delete the object from R2
  await r2.deleteObject(ctx, args.key);

  // Log the action
  await logAction(
    ctx,
    "delete_file",
    "DATA_CHANGE",
    "MEDIUM",
    `Deleted file: ${args.key}`,
    currentUser._id,
    undefined,
    { 
      key: args.key,
      metadata
    }
  );

  return { 
    success: true, 
    key: args.key 
  };
};