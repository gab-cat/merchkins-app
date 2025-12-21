# Messenger Bot Integration

The Merchkins app includes an automated Messenger bot that handles order creation directly within Chatwoot. This bot allows customers to place orders by sending a product code, guiding them through variant selection, sizing, and quantity input.

## Overview

The bot operates as an Agent Bot within Chatwoot. It listens to incoming messages via webhooks and processes them to:

1.  Start an order flow when a valid product code is detected (e.g., `CODE: PROD123`).
2.  manage the conversation state (managing selections for variants, sizes, etc.).
3.  Hand off the conversation to a human agent when necessary.

## Configuration

### Environment Variables

The following environment variables are required in your Convex dashboard:

- `NEXT_PUBLIC_CHATWOOT_BASE_URL`: The URL of your Chatwoot instance (e.g., `https://chat.merchkins.com`).
- `CHATWOOT_PLATFORM_APP_TOKEN`: The platform token for creating agent bots.
- `CHATWOOT_BOT_TOKEN`: A fallback bot token (optional).

### Chatwoot Setup

The bot is automatically created and assigned to an organization when needed. The system ensures:

1.  An Agent Bot exists for the Chatwoot account.
2.  The bot's `outgoing_url` is set to `${process.env.CONVEX_SITE_URL}/chatwoot-webhook`, ensuring webhooks are delivered to the Merchkins backend.

## Bot Features

### 1. Order Initiation

Customers start an order by sending a message starting with `CODE:` followed by the product code.

**Example:**

> CODE: SHIRT-001

### 2. Order Flow

Once started, the bot guides the user through the following steps:

1.  **Variant Selection**: If the product has variants (e.g., colors), the user selects one.
2.  **Size Selection**: If the variant has sizes, the user selects a size.
3.  **Quantity**: The user enters the desired quantity (1-99).
4.  **Notes**: Optional notes for the order.
5.  **Email/Contact**:
    - If the user is new, they are prompted for their email.
    - An OTP is sent to the email for verification.
6.  **Confirmation**: The order is created, and a confirmation is shown.

### 3. Human Handoff

The bot automatically hands off the conversation to a human agent (setting status to `open`) in the following scenarios:

- **Non-Command Messages**: If a user sends a message that does **not** start with `CODE:` and they are not currently in an active order session (e.g., "Hi, where is my order?"), the bot hands off to a human.
- **Cancellation**: If a user cancels an active order flow (by selecting "Cancel" or typing "cancel"), the bot confirms the cancellation and then hands off to a human agent.

## Technical Architecture

- **Webhook Handler**: `convex/chatwoot/actions/processWebhook.ts` receives events from Chatwoot.
- **Session Management**: `convex/chatwoot/orderFlow/sessionManager.ts` tracks the user's progress through the order steps.
- **Step Handlers**: `convex/chatwoot/orderFlow/orderStepHandlers.ts` contains the logic for processing inputs at each step.
- **Agent Bot Actions**: `convex/chatwoot/actions/agentBot.ts` handles bot creation and the `handoffToHuman` action.

## Troubleshooting

### Bot not responding

- Check if the `outgoing_url` is correctly set in Chatwoot (Settings -> Agent Bots).
- Verify that the webhook handler in Convex is deployed and accessible.
- Check Convex logs for any errors in `processWebhook`.

### Webhook errors

- Ensure `process.env.CONVEX_SITE_URL` is set correctly.
- Verify that the Chatwoot Platform App token is valid.

## Bot Creation & Assignment Lifecycle

The system is designed to handle multiple organizations and inboxes dynamically.

### Dynamic Bot Creation

When a message arrives at an inbox that doesn't have an associated bot token:

1.  **Inbox Identification**: The webhook payload contains the inbox name.
2.  **Organization Lookup**: We look up the organization in our database by matching the inbox name.
3.  **Bot Check**: We check if `chatwootAgentBotToken` is present in the organization document.
4.  **Creation**: If missing, we call `getOrCreateAgentBot` which:
    - Uses the `CHATWOOT_PLATFORM_APP_TOKEN` to call Chatwoot API.
    - Creates a new Agent Bot with `outgoing_url` pointing to our webhook.
    - Stores the `botId` and `accessToken` in the Organization document.
5.  **Assignment**: The bot performs actions on behalf of this inbox using the new token.

This ensures that new stores/inboxes are automatically onboarded without manual bot configuration.

## Detailed Message Flow

Here is the step-by-step journey of a message:

1.  **Webhook Event**:
    - User sends message on Messenger.
    - Chatwoot receives message and sends `message_created` webhook to `${CONVEX_SITE_URL}/chatwoot-webhook`.

2.  **Request Processing** (`convex/http.ts`):
    - Validates JSON payload.
    - Calls `api.chatwoot.actions.processWebhook.processWebhookEvent`.

3.  **Event Handling** (`convex/chatwoot/actions/processWebhook.ts`):
    - **Validation**: Ignores private messages, outgoing messages, or non-Facebook channels.
    - **Token Resolution**: Calls `getBotToken` to retrieve (or create) the bot token for the specific inbox organization.
    - **Session Check**: Checks `messengerOrderSessions` for an active order session for this conversation.

4.  **Logic Branching**:
    - **Branch A: Active Session**:
      - If session exists, routes input to `convex/chatwoot/orderFlow/orderStepHandlers.ts`.
      - Handles input based on current step (e.g., `VARIANT_SELECTION`, `SIZE_SELECTION`).
    - **Branch B: New Order Command**:
      - If message starts with `CODE:`, verifies product code.
      - Calls `startOrderFlow` to create session and send first prompt.
    - **Branch C: Human Handoff**:
      - If neither A nor B, calls `api.chatwoot.actions.agentBot.handoffToHuman`.
      - Updates conversation status to `open` so a human agent sees it.
