import { internal } from '../_generated/api';
import { httpAction } from '../_generated/server';

export const xenditWebhookHandler = httpAction(async (ctx, request) => {
  try {
    // Get the Xendit callback token from environment variables
    const callbackToken = process.env.XENDIT_CALLBACK_TOKEN;

    if (!callbackToken) {
      console.error('XENDIT_CALLBACK_TOKEN is not set');
      return new Response('Webhook token not configured', { status: 500 });
    }

    // Get the x-callback-token header
    const xCallbackToken = request.headers.get('x-callback-token');

    if (!xCallbackToken || xCallbackToken !== callbackToken) {
      console.error('Invalid or missing x-callback-token header');
      return new Response('Unauthorized', { status: 401 });
    }

    // Get the raw body
    const body = await request.text();
    let webhookEvent;

    try {
      webhookEvent = JSON.parse(body);
    } catch (parseError) {
      console.error('Failed to parse webhook body:', parseError);
      return new Response('Invalid JSON', { status: 400 });
    }

    console.log('Received Xendit webhook:', webhookEvent.id, webhookEvent.status);

    // Process the webhook event
    try {
      const result = await ctx.runMutation(internal.payments.mutations.index.handleXenditWebhook, {
        webhookEvent,
      });

      // Check if the order was not found
      if (result.processed === false && result.reason === 'Order not found') {
        return new Response('Order not found', { status: 404 });
      }
    } catch (error) {
      console.error('Error processing Xendit webhook:', error);
      return new Response('Internal server error', { status: 500 });
    }

    return new Response('Webhook processed successfully', { status: 200 });
  } catch (error) {
    console.error('Error handling Xendit webhook:', error);
    return new Response('Internal server error', { status: 500 });
  }
});
