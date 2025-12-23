import { api } from '../_generated/api';
import { httpAction } from '../_generated/server';
import { ChatwootWebhookEvent } from '../chatwoot/types';

export const chatwootWebhookHandler = httpAction(async (ctx, request) => {
  try {
    // Parse the incoming webhook event
    const body = await request.text();
    let webhookEvent: ChatwootWebhookEvent;

    try {
      webhookEvent = JSON.parse(body);
    } catch (parseError) {
      console.error('[Chatwoot Webhook] Failed to parse body:', parseError);
      return new Response('Invalid JSON', { status: 400 });
    }

    // Process the webhook event using the action
    // Note: We use runAction for Node.js runtime to make external API calls
    const result = await ctx.runAction(api.chatwoot.actions.processWebhook.processWebhookEvent, {
      event: webhookEvent,
    });

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[Chatwoot Webhook] Error:', error);
    return new Response('Internal server error', { status: 500 });
  }
});
