'use node';

import { action } from '../../_generated/server';
import { v } from 'convex/values';
import { api } from '../../_generated/api';
import { createHmac } from 'node:crypto';

/**
 * Generate HMAC hash for Chatwoot identity validation
 * Uses SHA256 HMAC based on the user identifier and organization's identity token
 */
export const generateChatwootHmac = action({
  args: {
    identifier: v.string(), // User's unique identifier (typically Convex user ID)
    organizationId: v.optional(v.id('organizations')), // Optional: for org-specific tokens
  },
  returns: v.string(), // Returns the HMAC hash as hex string
  handler: async (ctx, args): Promise<string> => {
    let identityToken: string | undefined;

    // If organizationId is provided, fetch the org's identity token
    if (args.organizationId) {
      const organization = await ctx.runQuery(api.organizations.queries.index.getOrganizationById, {
        organizationId: args.organizationId,
      });

      if (organization?.chatwootIdentityToken) {
        identityToken = organization.chatwootIdentityToken;
      }
    }

    // Fall back to platform default if org token not found
    if (!identityToken) {
      identityToken = process.env.CHATWOOT_IDENTITY_TOKEN;
      console.log('Using platform default identity token: ', identityToken);
    }

    if (!identityToken) {
      throw new Error('Chatwoot identity token not configured');
    }

    // Generate HMAC using SHA256
    const hmac = createHmac('sha256', identityToken);
    hmac.update(args.identifier);
    return hmac.digest('hex');
  },
});
