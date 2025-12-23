import { httpRouter } from 'convex/server';
import { clerkWebhookHandler, xenditWebhookHandler, resolveOrgHandler, productsFeedHandler, chatwootWebhookHandler } from './httpActions';

const http = httpRouter();

// Webhook endpoint for Clerk events
http.route({
  path: '/clerk-webhook',
  method: 'POST',
  handler: clerkWebhookHandler,
});

// Webhook endpoint for Xendit payment notifications
http.route({
  path: '/xendit-webhook',
  method: 'POST',
  handler: xenditWebhookHandler,
});

// Organization slug resolver for middleware
http.route({
  path: '/resolve-org',
  method: 'GET',
  handler: resolveOrgHandler,
});

// Google Merchant Center Product Feed (RSS/XML format)
http.route({
  path: '/products.xml',
  method: 'GET',
  handler: productsFeedHandler,
});

// Webhook endpoint for Chatwoot Bot (Platform App integration)
http.route({
  path: '/chatwoot-webhook',
  method: 'POST',
  handler: chatwootWebhookHandler,
});

export default http;
