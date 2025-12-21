'use node';

import { action, ActionCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { api, internal } from '../../_generated/api';
import { ChatwootWebhookEvent, ChatwootCreateMessagePayload } from '../types';
import { findKeywordResponse } from '../keywordConfig';

const CHATWOOT_BASE_URL = process.env.NEXT_PUBLIC_CHATWOOT_BASE_URL || 'https://chat.merchkins.com';

/**
 * Send a message to a Chatwoot conversation using the Agent Bot token.
 */
async function sendChatwootMessage(accountId: number, conversationId: number, content: string, botToken: string): Promise<boolean> {
  const url = `${CHATWOOT_BASE_URL}/api/v1/accounts/${accountId}/conversations/${conversationId}/messages`;

  const payload: ChatwootCreateMessagePayload = {
    content,
    message_type: 'outgoing',
    private: false,
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        api_access_token: botToken,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Chatwoot Bot] Failed to send message:', response.status, errorText);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[Chatwoot Bot] Error sending message:', error);
    return false;
  }
}

/**
 * Extract product code from message if it starts with "CODE: "
 * Returns the code (trimmed, case-insensitive match for prefix)
 */
function extractProductCode(message: string): string | null {
  const trimmed = message.trim();
  const match = trimmed.match(/^CODE:\s*(.+)/i);
  return match ? match[1].trim() : null;
}

/**
 * Extract selected value from input_select response
 * Chatwoot sends the selected value in content_attributes when user clicks an option
 * OR as the message content directly (the title of the selected item)
 */
function extractSelectedValue(event: ChatwootWebhookEvent): string | null {
  // First check content_attributes.submitted_values (some Chatwoot versions)
  const contentAttrs = event.content_attributes;
  if (contentAttrs?.submitted_values) {
    const submitted = contentAttrs.submitted_values as Record<string, string>;
    const values = Object.values(submitted);
    if (values.length > 0) {
      console.log('[Chatwoot Bot] Found submitted_values:', values[0]);
      return values[0];
    }
  }

  // Check if items array exists in content_attributes (indicates response to input_select)
  if (contentAttrs?.items) {
    const items = contentAttrs.items as Array<{ title: string; value: string }>;
    const content = event.content?.trim();
    if (content && items.length > 0) {
      // Find the item whose title matches the content
      const matchedItem = items.find((item) => item.title === content);
      if (matchedItem) {
        console.log('[Chatwoot Bot] Matched item by title:', matchedItem.value);
        return matchedItem.value;
      }
    }
  }

  // Log for debugging
  console.log('[Chatwoot Bot] extractSelectedValue - content:', event.content);
  console.log('[Chatwoot Bot] extractSelectedValue - content_attributes:', JSON.stringify(contentAttrs));

  return null;
}

/**
 * Get bot token for the organization or fallback to env
 */
async function getBotToken(ctx: ActionCtx, inboxName: string | undefined, accountId: number): Promise<string | undefined> {
  let botToken: string | undefined;

  if (inboxName) {
    const org = await ctx.runQuery(api.organizations.queries.index.getOrganizationByName, {
      name: inboxName,
    });

    if (org?.chatwootAgentBotToken) {
      botToken = org.chatwootAgentBotToken;
    } else if (org) {
      // Create agent bot dynamically
      const botResult = await ctx.runAction(api.chatwoot.actions.agentBot.getOrCreateAgentBot, {
        organizationId: org._id,
        accountId: accountId,
      });

      if (botResult.success && botResult.botToken) {
        botToken = botResult.botToken;
      }
    }
  }

  // Fallback to env bot token
  if (!botToken) {
    botToken = process.env.CHATWOOT_BOT_TOKEN;
  }

  return botToken;
}

/**
 * Process incoming Chatwoot webhook event and respond if keywords match.
 * Handles both regular messages and order flow interactions.
 */
export const processWebhookEvent = action({
  args: {
    event: v.any(),
  },
  returns: v.object({
    processed: v.boolean(),
    responded: v.boolean(),
    reason: v.optional(v.string()),
  }),
  handler: async (ctx, args): Promise<{ processed: boolean; responded: boolean; reason?: string }> => {
    const webhookEvent = args.event as ChatwootWebhookEvent;

    // Only process FacebookPage incoming messages
    if (webhookEvent.conversation?.channel !== 'Channel::FacebookPage') {
      return { processed: true, responded: false, reason: 'Not a FacebookPage message' };
    }
    if (webhookEvent.event !== 'message_created' && webhookEvent.event !== 'message_updated') {
      return { processed: true, responded: false, reason: 'Not a message event' };
    }
    if (webhookEvent.message_type !== 'incoming') {
      return { processed: true, responded: false, reason: 'Not an incoming message' };
    }
    if (webhookEvent.private) {
      return { processed: true, responded: false, reason: 'Private message' };
    }

    const conversationId = webhookEvent.conversation?.id;
    const accountId = webhookEvent.account?.id;
    const contactId = webhookEvent.sender?.id;
    const inboxName = webhookEvent.inbox?.name;

    if (!conversationId || !accountId || !contactId) {
      console.error('[Chatwoot Bot] Missing conversation, account, or contact ID');
      return { processed: false, responded: false, reason: 'Missing required IDs' };
    }

    const messageContent = webhookEvent.content || '';
    const selectedValue = extractSelectedValue(webhookEvent);

    // Get bot token
    const botToken = await getBotToken(ctx as any, inboxName, accountId);
    if (!botToken) {
      console.error('[Chatwoot Bot] No bot token available');
      return { processed: true, responded: false, reason: 'No bot token configured' };
    }

    // Check for active order session
    const session = await ctx.runQuery(internal.chatwoot.orderFlow.sessionManager.getActiveSession, {
      conversationId,
    });

    if (session) {
      // Route to appropriate handler based on session step
      const step = session.currentStep;

      try {
        // For input_select responses, selectedValue may be null if Chatwoot sends as plain text
        // In that case, pass the messageContent and let the handler parse it
        const selectionInput = selectedValue || messageContent;

        if (step === 'VARIANT_SELECTION' && selectionInput) {
          console.log('[Chatwoot Bot] Handling VARIANT_SELECTION with:', selectionInput);
          await ctx.runAction(internal.chatwoot.orderFlow.orderStepHandlers.handleVariantSelection, {
            sessionId: session._id,
            selectedValue: selectionInput,
            accountId,
            conversationId,
            botToken,
          });
          return { processed: true, responded: true, reason: `Handled ${step}` };
        }

        if (step === 'SIZE_SELECTION' && selectionInput) {
          console.log('[Chatwoot Bot] Handling SIZE_SELECTION with:', selectionInput);
          await ctx.runAction(internal.chatwoot.orderFlow.orderStepHandlers.handleSizeSelection, {
            sessionId: session._id,
            selectedValue: selectionInput,
            accountId,
            conversationId,
            botToken,
          });
          return { processed: true, responded: true, reason: `Handled ${step}` };
        }

        if (step === 'QUANTITY_INPUT' && messageContent) {
          await ctx.runAction(internal.chatwoot.orderFlow.orderStepHandlers.handleQuantityInput, {
            sessionId: session._id,
            quantityText: messageContent,
            accountId,
            conversationId,
            botToken,
          });
          return { processed: true, responded: true, reason: `Handled ${step}` };
        }

        if (step === 'NOTES_INPUT') {
          const notesValue = selectedValue || messageContent;
          if (notesValue) {
            await ctx.runAction(internal.chatwoot.orderFlow.orderStepHandlers.handleNotesInput, {
              sessionId: session._id,
              notesText: notesValue,
              accountId,
              conversationId,
              botToken,
            });
            return { processed: true, responded: true, reason: `Handled ${step}` };
          }
        }

        if (step === 'EMAIL_INPUT' && messageContent) {
          await ctx.runAction(internal.chatwoot.orderFlow.emailHandlers.handleEmailInput, {
            sessionId: session._id,
            emailText: messageContent,
            contactId,
            accountId,
            conversationId,
            botToken,
          });
          return { processed: true, responded: true, reason: `Handled ${step}` };
        }

        if (step === 'OTP_VERIFICATION' && messageContent) {
          await ctx.runAction(internal.chatwoot.orderFlow.emailHandlers.handleOTPVerification, {
            sessionId: session._id,
            otpText: messageContent,
            contactId,
            accountId,
            conversationId,
            botToken,
          });
          return { processed: true, responded: true, reason: `Handled ${step}` };
        }

        // Session exists but no matching handler - let it fall through
      } catch (error) {
        console.error('[Chatwoot Bot] Order flow error:', error);
        return { processed: true, responded: false, reason: `Order flow error: ${error}` };
      }
    }

    // Check for product code to start new order flow
    const productCode = extractProductCode(messageContent);
    if (productCode) {
      const product = await ctx.runQuery(api.products.queries.index.getProductByCode, {
        code: productCode,
      });

      if (product) {
        // Start order flow
        const result = await ctx.runAction(internal.chatwoot.orderFlow.startOrderFlow.startOrderFlow, {
          productId: product._id,
          productCode,
          conversationId,
          accountId,
          contactId,
          inboxName,
          botToken,
        });

        return {
          processed: true,
          responded: result.success,
          reason: result.reason,
        };
      } else {
        // Product not found
        await sendChatwootMessage(accountId, conversationId, `Sorry, no product found with code: ${productCode}`, botToken);
        return { processed: true, responded: true, reason: 'Product not found' };
      }
    }

    // If no product code and no active session, hand off to human agent
    // The bot only handles order flows initiated via "CODE: xxx" messages
    console.log('[Chatwoot Bot] No active session or product code, handing off to human');

    await ctx.runAction(api.chatwoot.actions.agentBot.handoffToHuman, {
      accountId,
      conversationId,
      botToken,
    });

    return {
      processed: true,
      responded: false,
      reason: 'Handed off to human - not a product code',
    };
  },
});
