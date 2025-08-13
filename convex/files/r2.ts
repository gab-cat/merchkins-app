import { R2 } from "@convex-dev/r2";
import { components } from "../_generated/api";

export const r2 = new R2(components.r2);

export const { generateUploadUrl, syncMetadata } = r2.clientApi({
  checkUpload: async (ctx, bucket) => {
    // For testing purposes, let's allow all uploads
    // In production, you should implement proper authentication
    console.log(`Upload check for bucket: ${bucket}`);
    
    // Try to get the current user from auth, but don't require it for testing
    try {
      const identity = await ctx.auth.getUserIdentity();
      if (identity) {
        console.log(`User authenticated: ${identity.email || identity.subject}`);
      } else {
        console.log('No authenticated user, but allowing upload for testing');
      }
    } catch (error) {
      console.log('Auth check failed, but allowing upload for testing:', error);
    }
  },
  onUpload: async (ctx, bucket, key) => {
    // This runs after the file is uploaded and metadata is synced
    // You can perform additional actions here like:
    // - Updating related entities
    // - Sending notifications
    // - Processing the file (e.g., image resizing)
    
    console.log(`File uploaded successfully: ${key} to bucket: ${bucket}`);
  },
});
