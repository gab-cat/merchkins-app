'use node';

// Chatwoot Order Flow - Email Handlers
// Email input and OTP verification for Messenger orders

import { v } from 'convex/values';
import { internalAction } from '../../_generated/server';
import { internal } from '../../_generated/api';
import { buildOTPPromptMessage, buildErrorMessage, sendChatwootMessage } from './messageBuilder';

// Generate 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// OTP expiry: 10 minutes
const OTP_EXPIRY_MS = 10 * 60 * 1000;

/**
 * Handle email input - validate email, generate OTP, send verification email
 */
export const handleEmailInputArgs = {
  sessionId: v.id('messengerOrderSessions'),
  emailText: v.string(),
  contactId: v.number(),
  accountId: v.number(),
  conversationId: v.number(),
  botToken: v.string(),
};

export const handleEmailInput = internalAction({
  args: handleEmailInputArgs,
  returns: v.object({
    success: v.boolean(),
    nextStep: v.optional(v.string()),
    reason: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    const { sessionId, emailText, contactId, accountId, conversationId, botToken } = args;

    // Basic email validation
    const email = emailText.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      await sendChatwootMessage(
        accountId,
        conversationId,
        buildErrorMessage('Please enter a valid email address (e.g., name@example.com).'),
        botToken
      );
      return { success: false, reason: 'Invalid email format' };
    }

    // Generate OTP
    const code = generateOTP();
    const now = Date.now();

    // Store OTP in database
    await ctx.runMutation(internal.chatwoot.orderFlow.emailVerification.createVerificationCode, {
      email,
      code,
      chatwootContactId: contactId,
      expiresAt: now + OTP_EXPIRY_MS,
    });

    // Send verification email
    await ctx.runAction(internal.chatwoot.orderFlow.sendOTPEmail.sendOTPEmail, {
      email,
      code,
    });

    // Update session
    await ctx.runMutation(internal.chatwoot.orderFlow.sessionManager.updateSession, {
      sessionId,
      email,
      currentStep: 'OTP_VERIFICATION',
    });

    // Send OTP prompt via Chatwoot
    const message = buildOTPPromptMessage(email);
    await sendChatwootMessage(accountId, conversationId, message, botToken);

    return { success: true, nextStep: 'OTP_VERIFICATION' };
  },
});

/**
 * Handle OTP verification input
 */
export const handleOTPVerificationArgs = {
  sessionId: v.id('messengerOrderSessions'),
  otpText: v.string(),
  contactId: v.number(),
  accountId: v.number(),
  conversationId: v.number(),
  botToken: v.string(),
};

export const handleOTPVerification = internalAction({
  args: handleOTPVerificationArgs,
  returns: v.object({
    success: v.boolean(),
    nextStep: v.optional(v.string()),
    reason: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    const { sessionId, otpText, contactId, accountId, conversationId, botToken } = args;

    // Get session to get email
    const session = await ctx.runQuery(internal.chatwoot.orderFlow.sessionManager.getActiveSession, {
      conversationId,
    });

    if (!session || !session.email) {
      await sendChatwootMessage(accountId, conversationId, buildErrorMessage('Session expired. Please start a new order.'), botToken);
      return { success: false, reason: 'Session not found' };
    }

    // Verify OTP
    const result = await ctx.runMutation(internal.chatwoot.orderFlow.emailVerification.verifyCode, {
      email: session.email,
      code: otpText.trim(),
    });

    if (!result.success) {
      if (result.reason === 'max_attempts') {
        await sendChatwootMessage(accountId, conversationId, buildErrorMessage('Too many incorrect attempts. Please start a new order.'), botToken);
        await ctx.runMutation(internal.chatwoot.orderFlow.sessionManager.updateSession, {
          sessionId,
          currentStep: 'CANCELLED',
        });
        return { success: false, nextStep: 'CANCELLED', reason: 'Max attempts exceeded' };
      }

      await sendChatwootMessage(
        accountId,
        conversationId,
        buildErrorMessage(`Invalid code. ${result.attemptsRemaining} attempts remaining.`),
        botToken
      );
      return { success: false, reason: 'Invalid OTP' };
    }

    // OTP verified - create or link user
    const userId = await ctx.runMutation(internal.chatwoot.orderFlow.emailVerification.getOrCreateUser, {
      email: session.email,
      chatwootContactId: contactId,
    });

    // Update session with user ID and proceed to checkout
    await ctx.runMutation(internal.chatwoot.orderFlow.sessionManager.updateSession, {
      sessionId,
      userId,
      currentStep: 'CHECKOUT',
    });

    // Complete the order
    await ctx.runAction(internal.chatwoot.orderFlow.completeOrder.completeOrder, {
      sessionId,
      accountId,
      conversationId,
      botToken,
    });

    return { success: true, nextStep: 'CHECKOUT' };
  },
});
