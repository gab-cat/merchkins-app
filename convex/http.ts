import { httpRouter } from 'convex/server';
import { httpAction } from './_generated/server';
import { api, internal } from './_generated/api';
import { ChatwootWebhookEvent } from './chatwoot/types';
import { Webhook } from 'svix';

const http = httpRouter();

// Webhook endpoint for Clerk events
http.route({
  path: '/clerk-webhook',
  method: 'POST',
  handler: httpAction(async (ctx, request) => {
    try {
      // Get the webhook secret from environment variables
      const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

      if (!webhookSecret) {
        console.error('CLERK_WEBHOOK_SECRET is not set');
        return new Response('Webhook secret not configured', { status: 500 });
      }

      // Get the Svix headers
      const svix_id = request.headers.get('svix-id');
      const svix_timestamp = request.headers.get('svix-timestamp');
      const svix_signature = request.headers.get('svix-signature');

      if (!svix_id || !svix_timestamp || !svix_signature) {
        console.error('Missing required svix headers');
        return new Response('Missing required headers', { status: 400 });
      }

      // Get the raw body
      const body = await request.text();

      // Create a new Svix instance with your webhook secret
      const wh = new Webhook(webhookSecret);

      let evt;
      try {
        // Verify the webhook signature
        evt = wh.verify(body, {
          'svix-id': svix_id,
          'svix-timestamp': svix_timestamp,
          'svix-signature': svix_signature,
        });
      } catch (err) {
        console.error('Error verifying webhook signature:', err);
        return new Response('Invalid signature', { status: 400 });
      }

      console.log('Webhook verified successfully');
      console.log('Received Clerk event:', (evt as { type: string }).type);

      const event = evt as { type: string; data: Record<string, unknown> };

      // Handle different event types
      switch (event.type) {
        case 'user.created':
          await ctx.runMutation(internal.users.mutations.clerkWebhook.handleUserCreated, {
            clerkUser: event.data,
          });
          break;

        case 'user.updated':
          await ctx.runMutation(internal.users.mutations.clerkWebhook.handleUserUpdated, {
            clerkUser: event.data,
          });
          break;

        case 'user.deleted':
          await ctx.runMutation(internal.users.mutations.clerkWebhook.handleUserDeleted, {
            clerkUserId: (event.data as { id: string }).id,
          });
          break;

        default:
          console.log('Unhandled event type:', event.type);
      }

      return new Response('Webhook processed successfully', { status: 200 });
    } catch (error) {
      console.error('Error processing Clerk webhook:', error);
      return new Response('Internal server error', { status: 500 });
    }
  }),
});

// Webhook endpoint for Xendit payment notifications
http.route({
  path: '/xendit-webhook',
  method: 'POST',
  handler: httpAction(async (ctx, request) => {
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
  }),
});

// Organization slug resolver for middleware
http.route({
  path: '/resolve-org',
  method: 'GET',
  handler: httpAction(async (ctx, request) => {
    try {
      const url = new URL(request.url);
      const slug = url.searchParams.get('slug');

      if (!slug) {
        return new Response('Missing slug parameter', { status: 400 });
      }

      const organization = await ctx.runQuery(api.organizations.queries.index.getOrganizationBySlug, {
        slug,
      });

      if (organization) {
        return new Response(JSON.stringify({ slug: organization.slug }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      } else {
        return new Response('Organization not found', { status: 404 });
      }
    } catch (error) {
      console.error('Error resolving organization:', error);
      return new Response('Internal server error', { status: 500 });
    }
  }),
});

// Webhook endpoint for Chatwoot Bot (Platform App integration)
http.route({
  path: '/chatwoot-webhook',
  method: 'POST',
  handler: httpAction(async (ctx, request) => {
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
  }),
});

export default http;
