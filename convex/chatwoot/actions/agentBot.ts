'use node';

import { action } from '../../_generated/server';
import { v } from 'convex/values';
import { api } from '../../_generated/api';

const CHATWOOT_BASE_URL = process.env.NEXT_PUBLIC_CHATWOOT_BASE_URL || 'https://chat.merchkins.com';

interface AgentBotResponse {
  id: number;
  name: string;
  description?: string;
  account_id?: number;
  access_token: string;
}

/**
 * Create an Agent Bot for a Chatwoot account using the Platform App API.
 * The Platform App token is used to create the bot, and the bot's own token is stored.
 */
export const createAgentBot = action({
  args: {
    organizationId: v.id('organizations'),
    accountId: v.number(),
    botName: v.optional(v.string()),
  },
  returns: v.object({
    success: v.boolean(),
    botId: v.optional(v.number()),
    error: v.optional(v.string()),
  }),
  handler: async (ctx, args): Promise<{ success: boolean; botId?: number; error?: string }> => {
    const platformAppToken = process.env.CHATWOOT_PLATFORM_APP_TOKEN;
    if (!platformAppToken) {
      return { success: false, error: 'CHATWOOT_PLATFORM_APP_TOKEN not configured' };
    }

    // Check if organization already has a bot
    const org = await ctx.runQuery(api.organizations.queries.index.getOrganizationById, {
      organizationId: args.organizationId,
    });

    if (!org) {
      return { success: false, error: 'Organization not found' };
    }

    if (org.chatwootAgentBotId && org.chatwootAgentBotToken) {
      console.log('[Chatwoot] Organization already has an agent bot:', org.chatwootAgentBotId);
      return { success: true, botId: org.chatwootAgentBotId };
    }

    const botName = args.botName || `Merchkins Bot - ${org.name}`;

    // Create Agent Bot via Platform API
    const url = `${CHATWOOT_BASE_URL}/platform/api/v1/agent_bots`;

    console.log('[Chatwoot] Creating agent bot:', botName);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          api_access_token: platformAppToken,
        },
        body: JSON.stringify({
          name: botName,
          description: `Automated bot for ${org.name} - handles keyword-based responses`,
          account_id: args.accountId,
          outgoing_url: `${process.env.CONVEX_SITE_URL}/chatwoot-webhook`,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[Chatwoot] Failed to create agent bot:', response.status, errorText);
        return { success: false, error: `Failed to create bot: ${response.status} - ${errorText}` };
      }

      const botData: AgentBotResponse = await response.json();
      console.log('[Chatwoot] Agent bot created:', botData.id, botData.access_token);

      // Store the bot credentials in the organization
      await ctx.runMutation(api.organizations.mutations.index.updateChatwootConfig, {
        organizationId: args.organizationId,
        chatwootAgentBotId: botData.id,
        chatwootAgentBotToken: botData.access_token,
        chatwootAccountId: args.accountId,
      });

      return { success: true, botId: botData.id };
    } catch (error) {
      console.error('[Chatwoot] Error creating agent bot:', error);
      return { success: false, error: String(error) };
    }
  },
});

/**
 * Get or create an Agent Bot for an account.
 * First checks if a bot already exists for this account.
 */
export const getOrCreateAgentBot = action({
  args: {
    organizationId: v.id('organizations'),
    accountId: v.number(),
  },
  returns: v.object({
    success: v.boolean(),
    botToken: v.optional(v.string()),
    error: v.optional(v.string()),
  }),
  handler: async (ctx, args): Promise<{ success: boolean; botToken?: string; error?: string }> => {
    // Get organization
    const org = await ctx.runQuery(api.organizations.queries.index.getOrganizationById, {
      organizationId: args.organizationId,
    });

    if (!org) {
      return { success: false, error: 'Organization not found' };
    }

    // If bot already exists, return its token
    if (org.chatwootAgentBotToken) {
      return { success: true, botToken: org.chatwootAgentBotToken };
    }

    // Create a new bot
    const result = await ctx.runAction(api.chatwoot.actions.agentBot.createAgentBot, {
      organizationId: args.organizationId,
      accountId: args.accountId,
    });

    if (!result.success) {
      return { success: false, error: result.error };
    }

    // Fetch the updated organization to get the token
    const updatedOrg = await ctx.runQuery(api.organizations.queries.index.getOrganizationById, {
      organizationId: args.organizationId,
    });

    return {
      success: true,
      botToken: updatedOrg?.chatwootAgentBotToken,
    };
  },
});

/**
 * Hand off a conversation to a human agent.
 * Changes the conversation status to 'open'.
 */
export const handoffToHuman = action({
  args: {
    accountId: v.number(),
    conversationId: v.number(),
    botToken: v.string(),
  },
  returns: v.object({
    success: v.boolean(),
    error: v.optional(v.string()),
  }),
  handler: async (ctx, args): Promise<{ success: boolean; error?: string }> => {
    const url = `${CHATWOOT_BASE_URL}/api/v1/accounts/${args.accountId}/conversations/${args.conversationId}/toggle_status`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          api_access_token: args.botToken,
        },
        body: JSON.stringify({
          status: 'open',
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[Chatwoot Handoff] Failed to toggle status:', response.status, errorText);
        return { success: false, error: `Failed to handoff: ${response.status} - ${errorText}` };
      }

      console.log('[Chatwoot Handoff] Successfully handed off conversation', args.conversationId, 'to human agent');
      return { success: true };
    } catch (error) {
      console.error('[Chatwoot Handoff] Error handing off:', error);
      return { success: false, error: String(error) };
    }
  },
});
