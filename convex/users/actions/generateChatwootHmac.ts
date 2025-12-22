'use node';

import { action } from '../../_generated/server';
import { v } from 'convex/values';
import { api } from '../../_generated/api';
import { createHmac } from 'node:crypto';
import { Id } from '../../_generated/dataModel';

/**
 * Generate HMAC hash for Chatwoot identity validation
 * Uses SHA256 HMAC based on the user identifier and organization's identity token
 * Caches tokens in database for efficiency
 */
export const generateChatwootHmac = action({
  args: {
    identifier: v.string(), // User's unique identifier (typically Convex user ID)
    organizationId: v.optional(v.id('organizations')), // Optional: for org-specific tokens
    inbox: v.optional(v.union(v.literal('admin'), v.literal('platform'), v.literal('org'))), // Which inbox to use
    organizationSlug: v.optional(v.string()), // Optional: organization slug for tracking
  },
  returns: v.string(), // Returns the HMAC hash as hex string
  handler: async (ctx, args): Promise<string> => {
    // Convert identifier to userId (assuming it's a user ID string)
    const userId = args.identifier as Id<'users'>;

    // First, check if a cached token exists
    const cachedToken = await ctx.runQuery(api.users.queries.index.getChatwootHmacToken, {
      userId,
      organizationId: args.organizationId,
      inbox: args.inbox,
    });

    if (cachedToken?.hmacToken) {
      console.log('Using cached Chatwoot HMAC token');
      return cachedToken.hmacToken;
    }

    // No cached token found, generate a new one
    let identityToken: string | undefined;
    let organizationSlug: string | undefined = args.organizationSlug;

    // Admin inbox uses a dedicated token
    if (args.inbox === 'admin') {
      identityToken = process.env.CHATWOOT_ADMIN_IDENTITY_TOKEN;
      if (!organizationSlug) {
        organizationSlug = 'admin';
      }
      console.log('Using admin identity token');
    }
    // If organizationId is provided, fetch the org's identity token
    else if (args.organizationId) {
      const organization = await ctx.runQuery(api.organizations.queries.index.getOrganizationById, {
        organizationId: args.organizationId,
      });

      if (organization?.chatwootIdentityToken) {
        identityToken = organization.chatwootIdentityToken;
      }

      // Get organization slug if not provided
      if (!organizationSlug && organization?.slug) {
        organizationSlug = organization.slug;
      }
    }

    // Fall back to platform default if org token not found
    if (!identityToken) {
      identityToken = process.env.CHATWOOT_IDENTITY_TOKEN;
      if (!organizationSlug) {
        organizationSlug = 'platform';
      }
      console.log('Using platform default identity token');
    }

    if (!identityToken) {
      throw new Error('Chatwoot identity token not configured');
    }

    // Generate HMAC using SHA256
    const hmac = createHmac('sha256', identityToken);
    hmac.update(args.identifier);
    const hmacToken = hmac.digest('hex');

    // Save the token to cache (race condition: check again before inserting)
    // This prevents duplicate inserts if multiple requests come in simultaneously
    const existingToken = await ctx.runQuery(api.users.queries.index.getChatwootHmacToken, {
      userId,
      organizationId: args.organizationId,
      inbox: args.inbox,
    });

    if (!existingToken) {
      // Only insert if it doesn't exist (double-check pattern)
      await ctx.runMutation(api.users.mutations.index.createChatwootHmacToken, {
        userId,
        organizationId: args.organizationId,
        inbox: args.inbox,
        organizationSlug,
        hmacToken,
      });
      console.log('Cached new Chatwoot HMAC token');
    } else {
      // Another request created it first, use that one
      console.log('Token was created by another request, using cached token');
      return existingToken.hmacToken;
    }

    return hmacToken;
  },
});
