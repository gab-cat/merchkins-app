import { mutation } from '../../_generated/server';
import { v } from 'convex/values';
import { internal } from '../../_generated/api';

// Generate 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// OTP expiry: 10 minutes
const OTP_EXPIRY_MS = 10 * 60 * 1000;

export const sendOTP = mutation({
  args: {
    email: v.string(),
  },
  returns: v.object({
    success: v.boolean(),
    otp: v.optional(v.string()), // Only returned if IS_STAGING is true
    reason: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    // Basic email validation
    const email = args.email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return { success: false, reason: 'Invalid email format' };
    }

    // Generate OTP
    const code = generateOTP();
    const now = Date.now();

    // Store OTP in database (reuse emailVerificationCodes table)
    await ctx.runMutation(internal.chatwoot.orderFlow.emailVerification.createVerificationCode, {
      email,
      code,
      chatwootContactId: undefined, // Not needed for guest checkout
      expiresAt: now + OTP_EXPIRY_MS,
    });

    // Schedule email sending (mutations can't call actions directly)
    await ctx.scheduler.runAfter(0, internal.chatwoot.orderFlow.sendOTPEmail.sendOTPEmail, {
      email,
      code,
    });

    // Check if IS_STAGING is enabled - return OTP for testing
    const isStaging = process.env.IS_STAGING === 'true';

    return {
      success: true,
      otp: isStaging ? code : undefined,
    };
  },
});
