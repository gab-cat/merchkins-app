import { query } from "../../_generated/server";
import { v } from "convex/values";
import { r2 } from "../r2";

// Get public URL for a file key or return URL as-is if already a URL
export const getPublicUrl = query({
  args: {
    keyOrUrl: v.string(),
    expiresIn: v.optional(v.number()), // Optional expiration time in seconds
  },
  returns: v.string(),
  handler: async (ctx, args) => {
    const { keyOrUrl, expiresIn } = args;

    // If it's already a full URL, return it as-is
    if (keyOrUrl.startsWith('http://') || keyOrUrl.startsWith('https://')) {
      return keyOrUrl;
    }

    // If we have a public base URL configured, construct the public URL
    const baseUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
    if (baseUrl) {
      return `${baseUrl.replace(/\/+$/, '')}/${keyOrUrl.replace(/^\/+/, '')}`;
    }

    // Fallback to signed URL from R2
    return await r2.getUrl(keyOrUrl, {
      expiresIn: expiresIn || 900, // Default 15 minutes
    });
  },
});
