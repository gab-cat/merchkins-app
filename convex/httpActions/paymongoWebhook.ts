import { internal } from '../_generated/api';
import { httpAction } from '../_generated/server';
import type { PaymongoWebhookEvent } from '../../types/paymongo';

/**
 * Paymongo webhook handler
 *
 * Note: For production, webhook signature verification should be implemented.
 * Paymongo uses HMAC-SHA256 for signing webhooks. Since Convex HTTP actions
 * run in a V8 runtime (not Node.js), we use the Web Crypto API for verification.
 *
 * In development/testing, you may want to disable signature verification.
 */
export const paymongoWebhookHandler = httpAction(async (ctx, request) => {
  try {
    // Get the Paymongo webhook secret from environment variables
    const webhookSecret = process.env.PAYMONGO_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error('PAYMONGO_WEBHOOK_SECRET is not set');
      return new Response('Webhook secret not configured', { status: 500 });
    }

    // Get the signature header
    const signature = request.headers.get('paymongo-signature');

    if (!signature) {
      console.error('Missing paymongo-signature header');
      return new Response('Missing signature', { status: 401 });
    }

    // Get the raw body
    const body = await request.text();

    // Verify signature using Web Crypto API
    const isValid = await verifyPaymongoSignature(body, signature, webhookSecret);

    if (!isValid) {
      console.error('Invalid webhook signature');
      return new Response('Invalid signature', { status: 401 });
    }

    let webhookEvent: PaymongoWebhookEvent;

    try {
      webhookEvent = JSON.parse(body);
    } catch (parseError) {
      console.error('Failed to parse webhook body:', parseError);
      return new Response('Invalid JSON', { status: 400 });
    }

    console.log('Received Paymongo webhook:', { id: webhookEvent.id, type: webhookEvent.type });

    // Process the webhook event
    try {
      const result = await ctx.runMutation(internal.payments.mutations.index.handlePaymongoWebhook, {
        webhookEvent,
      });

      // Check if processing failed
      if (result.processed === false && result.reason === 'Order not found') {
        return new Response('Order not found', { status: 404 });
      }
    } catch (error) {
      console.error('Error processing Paymongo webhook:', error);
      return new Response('Internal server error', { status: 500 });
    }

    return new Response('Webhook processed successfully', { status: 200 });
  } catch (error) {
    console.error('Error handling Paymongo webhook:', error);
    return new Response('Internal server error', { status: 500 });
  }
});

/**
 * Verify Paymongo webhook signature using Web Crypto API
 * Paymongo uses HMAC-SHA256 to sign webhook payloads
 *
 * Signature format: t=timestamp,te=test_signature or li=live_signature
 */
async function verifyPaymongoSignature(payload: string, signature: string, secret: string): Promise<boolean> {
  try {
    // Parse signature components
    const parts = signature.split(',').reduce(
      (acc, part) => {
        const [key, value] = part.split('=');
        acc[key] = value;
        return acc;
      },
      {} as Record<string, string>
    );

    const timestamp = parts['t'];
    const testSignature = parts['te'];
    const liveSignature = parts['li'];

    if (!timestamp) {
      console.error('Missing timestamp in signature');
      return false;
    }

    // Use live signature if available, otherwise test signature
    const expectedSignature = liveSignature || testSignature;
    if (!expectedSignature) {
      console.error('Missing signature value');
      return false;
    }

    // Create signed payload: timestamp + '.' + payload
    const signedPayload = `${timestamp}.${payload}`;

    // Import the secret key for HMAC
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const key = await crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);

    // Compute HMAC-SHA256
    const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(signedPayload));

    // Convert to hex string
    const hashArray = Array.from(new Uint8Array(signatureBuffer));
    const computedSignature = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

    // Convert signatures to Buffer-like structures (Uint8Array) for constant-time comparison
    // Using same encoding (UTF-8) for both
    const computedSignatureBuffer = encoder.encode(computedSignature);
    const expectedSignatureBuffer = encoder.encode(expectedSignature);

    // Verify lengths match first (early return prevents timing leaks from length differences)
    if (computedSignatureBuffer.length !== expectedSignatureBuffer.length) {
      return false;
    }

    // Use timing-safe comparison (constant-time to prevent timing attacks)
    // Since we're in a V8 runtime (not Node.js), we implement a constant-time comparison
    // that performs the same operation regardless of where differences occur
    let result = 0;
    for (let i = 0; i < computedSignatureBuffer.length; i++) {
      result |= computedSignatureBuffer[i] ^ expectedSignatureBuffer[i];
    }
    return result === 0;
  } catch (error) {
    console.error('Error verifying signature:', error);
    return false;
  }
}
