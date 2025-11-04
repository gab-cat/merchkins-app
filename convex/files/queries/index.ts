import { query } from '../../_generated/server';
import { v } from 'convex/values';
import { r2 } from '../r2';
import { requireAuthentication } from '../../helpers';

// Get file URL by key
export const getFileUrl = query({
  args: {
    key: v.string(),
    expiresIn: v.optional(v.number()), // Optional expiration time in seconds
  },
  handler: async (ctx, args) => {
    // You may want to add authentication checks here depending on your use case
    return await r2.getUrl(args.key, {
      expiresIn: args.expiresIn || 900, // Default 15 minutes
    });
  },
});

// Get file metadata by key
export const getFileMetadata = query({
  args: {
    key: v.string(),
  },
  handler: async (ctx, args) => {
    return await r2.getMetadata(ctx, args.key);
  },
});

// List file metadata with pagination
export const listFiles = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Require authentication to list files
    await requireAuthentication(ctx);

    return await r2.listMetadata(ctx, args.limit || 10);
  },
});
