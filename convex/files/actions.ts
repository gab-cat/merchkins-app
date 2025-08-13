"use node";

import { action } from "../_generated/server";
import { v } from "convex/values";
import { r2 } from "./r2";
// Note: Server-side image conversion is disabled to maintain compatibility with Convex runtime.
// Images should be compressed to WebP on the client before upload.

// Store a file from server-side (e.g., from URL download)
export const storeFileFromUrl = action({
  args: {
    url: v.string(),
    key: v.optional(v.string()),
    mimeType: v.optional(v.string()),
  },
  returns: v.string(), // Returns the key of the stored file
  handler: async (ctx, args) => {
    // Download the file
    const response = await fetch(args.url);
    if (!response.ok) {
      throw new Error(`Failed to download file from ${args.url}`);
    }
    
    const blob = await response.blob();
    const contentType = args.mimeType || response.headers.get('content-type') || undefined;

    // Store as-is (client should compress to WebP before upload)
    const key = await r2.store(ctx, blob, {
      key: args.key,
      type: contentType,
    });

    return key;
  },
});
