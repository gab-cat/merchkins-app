import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { Webhook } from "svix";

const http = httpRouter();

// Webhook endpoint for Clerk events
http.route({
  path: "/clerk-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      // Get the webhook secret from environment variables
      const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
      
      if (!webhookSecret) {
        console.error("CLERK_WEBHOOK_SECRET is not set");
        return new Response("Webhook secret not configured", { status: 500 });
      }

      // Get the Svix headers
      const svix_id = request.headers.get("svix-id");
      const svix_timestamp = request.headers.get("svix-timestamp");
      const svix_signature = request.headers.get("svix-signature");

      if (!svix_id || !svix_timestamp || !svix_signature) {
        console.error("Missing required svix headers");
        return new Response("Missing required headers", { status: 400 });
      }

      // Get the raw body
      const body = await request.text();

      // Create a new Svix instance with your webhook secret
      const wh = new Webhook(webhookSecret);

      let evt;
      try {
        // Verify the webhook signature
        evt = wh.verify(body, {
          "svix-id": svix_id,
          "svix-timestamp": svix_timestamp,
          "svix-signature": svix_signature,
        });
      } catch (err) {
        console.error("Error verifying webhook signature:", err);
        return new Response("Invalid signature", { status: 400 });
      }

      console.log("Webhook verified successfully");
      console.log("Received Clerk event:", (evt as { type: string }).type);

      const event = evt as { type: string; data: Record<string, unknown> };

      // Handle different event types
      switch (event.type) {
        case "user.created":
          await ctx.runMutation(internal.users.mutations.clerkWebhook.handleUserCreated, {
            clerkUser: event.data,
          });
          break;

        case "user.updated":
          await ctx.runMutation(internal.users.mutations.clerkWebhook.handleUserUpdated, {
            clerkUser: event.data,
          });
          break;

        case "user.deleted":
          await ctx.runMutation(internal.users.mutations.clerkWebhook.handleUserDeleted, {
            clerkUserId: (event.data as { id: string }).id,
          });
          break;

        default:
          console.log("Unhandled event type:", event.type);
      }

      return new Response("Webhook processed successfully", { status: 200 });
    } catch (error) {
      console.error("Error processing Clerk webhook:", error);
      return new Response("Internal server error", { status: 500 });
    }
  }),
});

export default http;
