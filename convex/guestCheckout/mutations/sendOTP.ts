import { mutation } from '../../_generated/server';
import { v } from 'convex/values';
import { internal } from '../../_generated/api';
import { logAction } from '../../helpers/utils';

// Generate 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// OTP expiry: 10 minutes
const OTP_EXPIRY_MS = 10 * 60 * 1000;

// Rate limiting constants
// Rate window: 15 minutes (900000 ms)
const RATE_WINDOW_MS = 15 * 60 * 1000;
// Maximum OTP requests per rate window
const MAX_OTPS_PER_WINDOW = 3;

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

    // Rate limiting check: query recent OTP requests for this email
    const now = Date.now();
    const rateWindowStart = now - RATE_WINDOW_MS;

    // Query recent codes using the composite index for performance
    const recentCodes = await ctx.db
      .query('emailVerificationCodes')
      .withIndex('by_email_createdAt', (q) => q.eq('email', email).gte('createdAt', rateWindowStart))
      .collect();

    const recentCount = recentCodes.length;

    const maskEmail = (email: string) => {
      const [local, domain] = email.split('@');
      return `${local[0]}***@${domain}`;
    };

    // Enforce rate limit
    if (recentCount >= MAX_OTPS_PER_WINDOW) {
      // Log rate-limit event for monitoring
      await logAction(
        ctx,
        'OTP_RATE_LIMIT_EXCEEDED',
        'SECURITY_EVENT',
        'MEDIUM',
        `Rate limit exceeded for email: ${maskEmail(email)}. ${recentCount} requests in the last ${RATE_WINDOW_MS / 1000 / 60} minutes`,
        undefined, // userId
        undefined, // organizationId
        {
          email: maskEmail(email),
          recentCount,
          rateWindowMs: RATE_WINDOW_MS,
          maxOtpsPerWindow: MAX_OTPS_PER_WINDOW,
        }
      );

      return {
        success: false,
        reason: 'Too many requests, try again later',
      };
    }

    // Generate OTP
    const code = generateOTP();

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
